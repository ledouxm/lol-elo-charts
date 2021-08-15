import { getRandomString } from "@pastable/core";
import { isAuthValid } from "./auth";
import { handleGamesEvent } from "./events/games";
import { handlePresenceEvents } from "./events/presence";
import { handleRoomsEvent } from "./events/rooms";
import fastify from "fastify";
import { getClientMeta, getClients, getClientState, getRoomFullState, makeUrl, makeUser } from "./helpers";
import { AppWebsocket, GameRoom, GlobalSubscription, LobbyRoom, Room, User, WsEventPayload } from "./types";
import { getRandomColor } from "./utils";
import WebSocket from "ws";
import { decode, sendMsg } from "./ws-helpers";

export const makeApp = () => {
    const app = fastify({ logger: true });

    app.get("/", async (request, reply) => {
        return { hello: "world" };
    });

    app.get("/status", async () => "ok");

    return app;
};

// TODO permissions/roles

const cleanupEvery = 30 * 1000;
export const makeWsRelay = (options: WebSocket.ServerOptions) => {
    const wss = new WebSocket.Server(options);
    const opts = { binary: false };

    // States
    const rooms = new Map<Room["name"], LobbyRoom>();
    const games = new Map<Room["name"], GameRoom>();
    const users = new Map<AppWebsocket["id"], User>();

    const userIds = new Set();
    let userCounts = 0; // auto-increment on connection

    const globalSubscriptions = new Map<GlobalSubscription, Set<AppWebsocket>>([
        ["presence", new Set()],
        ["rooms", new Set()],
        ["games", new Set()],
    ]);

    // State helpers
    const getUserId = (givenId: string) =>
        givenId ? (userIds.has(givenId) ? getRandomString(11) : givenId) : getRandomString(11);
    const getUser = (id: AppWebsocket["id"]) => {
        if (!users.has(id)) {
            users.set(id, makeUser());
        }

        return users.get(id);
    };

    const getAllClients = () => getClients(wss.clients as Set<AppWebsocket>);
    const getPresenceList = () => getAllClients().map(getClientState);
    const getPresenceMetaList = () => getAllClients().map(getClientMeta);

    wss.on("connection", (ws: AppWebsocket, req) => {
        const isValid = isAuthValid(ws, req);
        if (!isValid) return;

        // TODO clearInterval+setInterval on xxx/list to avoid duplication with globalSubscriptions

        // Misc
        const broadcastPresenceList = (excludeSelf?: boolean) =>
            globalSubscriptions.get("presence").forEach((client) => {
                console.log(excludeSelf && client.id !== ws.id);
                if (excludeSelf ? client.id === ws.id : false) return;
                console.log("sending", getPresenceList());
                sendMsg(client, ["presence/list", getPresenceList()]);
            });

        const broadcastSub = (sub: GlobalSubscription, [event, payload]: WsEventPayload) =>
            globalSubscriptions.get(sub).forEach((client) => sendMsg(client, [event.replace(".", "/"), payload]));
        const broadcastEvent = (room: Room, event: string, payload?: any) =>
            room.clients.forEach((client) => sendMsg(client, [event.replace(".", "/"), payload]));
        const sendPresenceList = () => sendMsg(ws, ["presence/list", getAllClients().map(getClientState)]);

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
            sendMsg(ws, ["rooms/state#" + room.name, getRoomFullState(room)]);

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
        const givenId = url.searchParams.get("id");
        ws.isAlive = true;
        ws.id = getUserId(givenId);
        userIds.add(ws.id);

        const user = getUser(ws.id);
        ws.user = user;
        user.clients.add(ws);

        ws.state = new Map(
            Object.entries({
                username: url.searchParams.get("username") || "Guest" + ++userCounts,
                color: url.searchParams.get("color") || getRandomColor(),
            })
        );
        ws.meta = new Map(Object.entries({ cursor: null }));
        ws.internal = new Map(Object.entries({ timers: new Map() }));

        // Send his presence
        sendMsg(ws, ["presence/update", getClientState(ws)]);

        // re-join rooms where the user is active on other clients
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

            // Remove user from each room he was in
            user.rooms.forEach((room) => {
                if (room.type === "game" && room.config.shouldRemovePlayerStateOnDisconnect) room.state.delete(ws.id);
                room.clients.delete(ws);
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
                    if (client.readyState !== WebSocket.OPEN) return;
                    if (!Array.isArray(payload.data)) return;

                    const canSend = event === "broadcast" ? client.id !== ws.id : true;
                    if (!canSend) return;

                    return client.send(data, opts);
                });
                return;
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
    });

    // Clean broken connections every X seconds
    const interval = setInterval(() => {
        (wss.clients as Set<AppWebsocket>).forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping(noop);
        });
    }, cleanupEvery);

    // On server close
    wss.on("close", () => {
        clearInterval(interval);
    });

    return wss;
};

function noop() {}
