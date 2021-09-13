import { IncomingMessage } from "http";

import { ObjectLiteral, getRandomString } from "@pastable/core";
import WebSocket from "ws";

import { getWsAuthState } from "./auth";
import { User } from "./entities/User";
import { handleGamesEvent } from "./events/games";
import { handlePresenceEvents } from "./events/presence";
import { handleRolesEvent } from "./events/roles";
import { handleRoomsEvent } from "./events/rooms";
import {
    getClientState,
    getClients,
    getEventParam,
    getRoomClients,
    getRoomState,
    makeUrl,
    makeWsClient,
} from "./helpers";
import { AppWebsocket, GameRoom, GlobalSubscription, Room, SimpleRoom, WsClient, WsEventPayload } from "./types";
import { getRandomColor } from "./utils";
import { decode, sendMsg } from "./ws-helpers";

export const onConnection = async (
    ws: AppWebsocket,
    req: IncomingMessage,
    {
        wss,
        opts,
        rooms,
        games,
        clients,
        clientCounts,
        globalSubscriptions,
        getAllClients,
        getPresenceList,
        getPresenceMetaList,
    }: WsContext
) => {
    const auth = await getWsAuthState(ws, req);
    if (!auth.isValid) return;

    // TODO clearInterval+setInterval on xxx/list to avoid duplication with globalSubscriptions
    const getWsClient = (id: AppWebsocket["id"], initialState: ObjectLiteral, user?: User) => {
        if (!clients.has(id)) {
            clients.set(id, makeWsClient(id, initialState, user));
        }

        return clients.get(id);
    };

    // Misc
    const broadcastPresenceList = (excludeSelf?: boolean) =>
        globalSubscriptions.get("presence").forEach((client) => {
            if (excludeSelf ? client.id === ws.id : false) return;
            sendMsg(client, ["presence/list", getPresenceList()]);
        });

    const broadcastSub = (sub: GlobalSubscription, [event, payload]: WsEventPayload) =>
        globalSubscriptions.get(sub).forEach((client) => sendMsg(client, [event.replace(".", "/"), payload]));
    const broadcastEvent = (room: Room, event: string, payload?: any) =>
        room.clients.forEach((client) => sendMsg(client, [event.replace(".", "/"), payload]));
    const sendPresenceList = () => sendMsg(ws, ["presence/list", getPresenceList()]);

    // Rooms
    const getRoomListEvent = () =>
        [
            "rooms/list",
            Array.from(rooms.entries()).map(([name, room]) => ({
                name,
                clients: getClients(room.clients).map((ws) => ws.id),
            })),
        ] as WsEventPayload;
    const sendRoomsList = () => sendMsg(ws, getRoomListEvent());
    const onJoinRoom = (room: Room) => {
        const presenceEvent = ["rooms/presence#" + room.name, getRoomClients(room)] as WsEventPayload;
        room.clients.forEach((client) => sendMsg(client, presenceEvent));
        room.watchers.forEach((client) => sendMsg(client, presenceEvent));

        sendMsg(ws, ["rooms/state#" + room.name, getRoomState(room)]);
        broadcastEvent(room, "rooms/join#" + room.name, getClientState(ws));
        broadcastSub("rooms", getRoomListEvent());
    };

    // Games
    const getGameRoomListEvent = () =>
        [
            "games/list",
            Array.from(games.entries()).map(([name, room]) => ({
                name,
                clients: getClients(room.clients).map((ws) => ws.id),
            })),
        ] as WsEventPayload;
    const sendGamesList = () => sendMsg(ws, getGameRoomListEvent());

    const url = makeUrl(req);
    ws.isAlive = true;
    ws.id = auth.user?.id || auth.id; // db user.id || random guest id
    ws.sessionId = getRandomString(14);

    const initialState = {
        username: auth.name || "Guest" + ++clientCounts,
        color: url.searchParams.get("color") || getRandomColor(),
    };
    const client = getWsClient(ws.id, initialState, auth.user);
    ws.client = client;
    client.sessions.add(ws);

    // Send his presence
    sendMsg(ws, ["presence/state", getClientState(ws)]);

    // re-join rooms where the user is active on other clients
    sendMsg(ws, ["presence/reconnect", Array.from(client.rooms).map((room) => ({ name: room.name, type: room.type }))]);
    client.rooms.forEach((room) => {
        room.clients.add(ws);
        onJoinRoom(room);
    });

    ws.on("pong", () => (ws.isAlive = true));
    ws.on("close", () => {
        broadcastPresenceList(true);

        // Remove user timers
        const timers = ws.client.internal.get("timers");
        timers.forEach((timer) => clearInterval(timer));
        timers.clear();

        // Remove user from each room he was in
        client.rooms.forEach((room) => {
            if (room.type === "game" && room.config.shouldRemovePlayerStateOnDisconnect) room.state.delete(ws.id);
            room.clients.delete(ws);

            // Notify everyone that has a common room with the user who left
            room.clients.forEach((client) => sendMsg(client, ["rooms/presence#" + room.name, getRoomClients(room)]));
            room.watchers.forEach((client) => sendMsg(client, ["rooms/presence#" + room.name, getRoomClients(room)]));
        });

        // TODO rm every user.clients ??
        // user.clients.forEach((client) => user.rooms.forEach((room) => room.clients.delete(client)));
    });

    broadcastPresenceList();

    const ref = {
        ws,
        opts,
        client,
        globalSubscriptions,
        clients,
        rooms,
        games,
        // Misc
        broadcastEvent,
        broadcastSub,
        broadcastPresenceList,
        // Presence
        getPresenceList,
        sendPresenceList,
        getPresenceMetaList,
        // Rooms
        getRoomListEvent,
        sendRoomsList,
        onJoinRoom,
        // Games
        getGameRoomListEvent,
        sendGamesList,
    };

    ws.on("message", (data: ArrayBuffer | string, _binary: boolean) => {
        const message = decode<WsEventPayload>(data);
        if (!message) return;

        const [event, payload] = message;
        if (!event) return;

        // console.log(">", message);
        // relay (everyone) / broadcast (everyone but self)
        if (["relay", "broadcast"].includes(event)) {
            (wss.clients as Set<AppWebsocket>).forEach((client) => {
                if (!Array.isArray(payload)) return;

                const canSend = event === "broadcast" ? client.id !== ws.id : true;
                if (!canSend) return;

                sendMsg(client, payload as any, opts);
            });
            return;
        }

        if (event.startsWith("dm")) {
            const userId = getEventParam(event);
            if (!userId) return sendMsg(ws, ["dm/missingUserId"], opts);

            const user = clients.get(userId);
            if (!user) return sendMsg(ws, ["dm/notFound"], opts);
            if (!user.sessions.size) return sendMsg(ws, ["dm/offline"], opts);

            // Echo to the sender so he knows it was received properly
            sendMsg(ws, payload, opts);
            user.sessions.forEach((client) => sendMsg(client, payload, opts));
        }

        if (event.startsWith("sub") || event.startsWith("unsub") || event.startsWith("presence.")) {
            return handlePresenceEvents({ ...ref, event, payload });
        }

        if (event.startsWith("roles.")) {
            return handleRolesEvent({ ...ref, event, payload });
        }

        if (event.startsWith("rooms.")) {
            return handleRoomsEvent({ ...ref, event, payload });
        }

        if (event.startsWith("games.")) {
            return handleGamesEvent({ ...ref, event, payload });
        }
    });
};

export interface WsContext {
    wss: WebSocket.Server;
    opts: { binary: boolean };
    rooms: Map<string, SimpleRoom<Map<any, any>>>;
    games: Map<string, GameRoom<Map<any, any>, Map<any, any>>>;
    clients: Map<string, WsClient>;
    clientCounts: number;
    globalSubscriptions: Map<GlobalSubscription, Set<AppWebsocket>>;
    getAllClients: () => AppWebsocket[];
    getPresenceList: () => any[];
    getPresenceMetaList: () => any[];
}
