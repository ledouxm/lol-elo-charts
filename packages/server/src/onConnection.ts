import { getRandomString } from "@pastable/core";
import { IncomingMessage } from "http";
import WebSocket from "ws";
import { getWsAuthState } from "./auth";
import { User } from "./entities/User";
import { handleGamesEvent } from "./events/games";
import { handlePresenceEvents } from "./events/presence";
import { handleRoomsEvent } from "./events/rooms";
import { getClients, getClientState, getEventParam, getRoomClients, getRoomState, makeUrl } from "./helpers";
import { AppWebsocket, GameRoom, GlobalSubscription, Room, SimpleRoom, WsEventPayload, WsUser } from "./types";
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
        users,
        userIds,
        userCounts,
        globalSubscriptions,
        getWsUser,
        getAllClients,
        getPresenceList,
        getPresenceMetaList,
    }: WsContext
) => {
    const auth = await getWsAuthState(ws, req);
    if (!auth.isValid) return;

    // TODO clearInterval+setInterval on xxx/list to avoid duplication with globalSubscriptions
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
    ws.id = auth.user?.id || auth.id;
    userIds.add(ws.id);

    const user = getWsUser(ws.id, auth.user);
    ws.user = user;
    user.clients.add(ws);

    ws.state = new Map(
        Object.entries({
            username: auth.name || "Guest" + ++userCounts,
            color: url.searchParams.get("color") || getRandomColor(),
        })
    );
    ws.meta = new Map(Object.entries({ sessionId: getRandomString() }));
    ws.internal = new Map(Object.entries({ timers: new Map() }));
    ws.roles = new Set(user.roles);

    // Send his presence
    sendMsg(ws, ["presence/state", getClientState(ws)]);

    // re-join rooms where the user is active on other clients
    sendMsg(ws, ["presence/reconnect", Array.from(user.rooms).map((room) => ({ name: room.name, type: room.type }))]);
    user.rooms.forEach((room) => {
        room.clients.add(ws);
        onJoinRoom(room);
    });

    ws.on("pong", () => (ws.isAlive = true));
    ws.on("close", () => {
        broadcastPresenceList(true);

        // Remove user timers
        const timers = ws.internal.get("timers") as Map<GlobalSubscription, NodeJS.Timer>;
        timers.forEach((timer) => clearInterval(timer));
        timers.clear();

        userIds.delete(ws.id); // Unlock user id

        // Save client roles in user
        ws.roles.forEach((role) => user.roles.add(role));

        // Remove user from each room he was in
        user.rooms.forEach((room) => {
            if (room.type === "game" && room.config.shouldRemovePlayerStateOnDisconnect) room.state.delete(ws.id);
            room.clients.delete(ws);

            // Notify everyone that has a common room with the user who left
            room.clients.forEach((client) => sendMsg(client, ["rooms/presence#" + room.name, getRoomClients(room)]));
        });

        // TODO rm every user.clients ??
        // user.clients.forEach((client) => user.rooms.forEach((room) => room.clients.delete(client)));
    });

    broadcastPresenceList();

    const ref = {
        ws,
        opts,
        user,
        globalSubscriptions,
        users,
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

            const user = users.get(userId);
            if (!user) return sendMsg(ws, ["dm/notFound"], opts);
            if (!user.clients.size) return sendMsg(ws, ["dm/offline"], opts);

            // Echo to the sender so he knows it was received properly
            sendMsg(ws, payload, opts);
            user.clients.forEach((client) => sendMsg(client, payload, opts));
        }

        if (event.startsWith("sub") || event.startsWith("unsub") || event.startsWith("presence.")) {
            return handlePresenceEvents({ ...ref, event, payload });
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
    users: Map<string, WsUser>;
    userIds: Set<WsUser["id"]>;
    userCounts: number;
    globalSubscriptions: Map<GlobalSubscription, Set<AppWebsocket>>;
    getWsUser: (id: AppWebsocket["id"], user?: User) => WsUser;
    getAllClients: () => AppWebsocket[];
    getPresenceList: () => any[];
    getPresenceMetaList: () => any[];
}
