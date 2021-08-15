import { platformerHooks } from "../games/platformer";
import {
    GameId,
    getEventParam,
    getGameFullState,
    getRoomClients,
    getRoomMeta,
    getRoomState,
    isUserInSet,
    makeGameRoom,
} from "../helpers";
import { AppWebsocket, EventHandlerRef, GameEvent, GameHooks, GameRoom } from "../types";
import { sendMsg } from "../ws-helpers";

export function handleGamesEvent({
    event,
    payload,
    ws,
    opts,
    user,
    games,
    broadcastSub,
    getGameRoomListEvent,
    sendGamesList,
}: EventHandlerRef) {
    if (event.startsWith("games.list")) {
        return sendGamesList();
    }

    !event.startsWith("games.update") && console.log(event);

    if (event.startsWith("games.create")) {
        const [eventName, name] = event.split("#");
        const gameId = eventName.split(".")[2];

        if (!name) return;
        if (games.get(name)) {
            sendMsg(ws, ["games/exists", name], opts);
            return console.error("games already exists");
        }
        if (!gameId) return console.error("no name provided");
        if (!Object.values(GameId).includes(gameId as any)) return console.error("wrong name", gameId);

        const gameRoom = makeGameRoom({ name, state: payload, hooks: hooksByGameName[gameId] });
        gameRoom.clients.add(ws);
        // gameRoom.hooks?.[event]?.({ ws, game: gameRoom })
        update("games.create", gameRoom, ws);

        games.set(name, gameRoom);
        user.rooms.add(gameRoom);

        // Game ticks
        const stateRefreshInterval = setInterval(
            () =>
                gameRoom.state.size &&
                gameRoom.clients.forEach((client) => sendMsg(client, ["games/state#" + name, getRoomState(gameRoom)])),
            gameRoom.config.tickRate
        );
        const timers = gameRoom.internal.get("timers") as Map<string, NodeJS.Timer>;
        timers.set("state", stateRefreshInterval);

        // Ensure that clients are sync
        const clientsRefreshInterval = setInterval(
            () =>
                gameRoom.clients.forEach((client) =>
                    sendMsg(client, ["games/clients#" + name, getRoomClients(gameRoom)])
                ),
            gameRoom.config.clientsRefreshRate
        );
        timers.set("clients", clientsRefreshInterval);

        broadcastSub("games", getGameRoomListEvent());
        return;
    }

    if (event.startsWith("games.join")) {
        const name = getEventParam(event);
        if (!name) return;

        const gameRoom = games.get(name);
        if (!gameRoom) return sendMsg(ws, ["games/notFound", name], opts);
        gameRoom.hooks?.["games.join"]?.({ ws, game: gameRoom });

        if (isUserInSet(gameRoom.clients, ws.id)) return;

        gameRoom.clients.add(ws);
        user.rooms.add(gameRoom);

        gameRoom.clients.forEach((client) => sendMsg(client, ["games/clients#" + name, getRoomClients(gameRoom)]));
        broadcastSub("games", getGameRoomListEvent());
        return;
    }

    if (event.startsWith("games.get")) {
        const name = getEventParam(event);
        if (!name) return;

        const room = games.get(name);
        if (!room) return sendMsg(ws, ["games/notFound", name], opts);

        sendMsg(ws, ["games/u#" + name, getGameFullState(room)]);
        return;
    }

    if (event.startsWith("games.get.meta")) {
        const name = getEventParam(event);
        if (!name) return;

        const room = games.get(name);
        if (!room) return sendMsg(ws, ["games/notFound", name], opts);

        const fields = (getEventParam(event, ":") || "").replace("#" + name, "").split(",");

        if (fields.length) {
            const meta = Object.fromEntries(
                Object.entries(room.meta)
                    .filter(([key, value]) => fields.includes(key))
                    .map(([key, value]) => [key, value])
            );

            sendMsg(ws, ["games/get.meta#" + name, meta]);
        } else {
            sendMsg(ws, ["games/get.meta#" + name, getRoomMeta(room)]);
        }

        return;
    }

    if (event.startsWith("games.leave")) {
        const name = getEventParam(event);
        if (!name) return;

        const room = games.get(name);
        if (!room) return sendMsg(ws, ["games/notFound", name], opts);

        room.clients.delete(ws);

        room.clients.forEach((client) => sendMsg(client, ["games/clients#" + name, getRoomClients(room)]));
        sendMsg(ws, ["games/leave#" + name], opts);
        broadcastSub("games", getGameRoomListEvent());
        return;
    }

    if (event.startsWith("games.kick")) {
        const name = getEventParam(event);
        if (!name) return;

        const room = games.get(name);
        if (!room) return sendMsg(ws, ["games/notFound", name], opts);

        // TODO check permissions
        const client = Array.from(room.clients).find((client) => client.id === payload);
        if (!client) return sendMsg(ws, ["clients/notFound", name], opts);

        room.clients.delete(client);
        client.user.rooms.delete(room);

        sendMsg(client, ["games/leave#" + name], opts);

        room.clients.forEach((client) => sendMsg(client, ["games/clients#" + name, getRoomClients(room)]));

        broadcastSub("rooms", getGameRoomListEvent());
        return;
    }

    if (event.startsWith("games.update")) {
        const name = getEventParam(event);
        if (!name) return;

        const game = games.get(name);
        if (!game) return sendMsg(ws, ["games/notFound", name], opts);

        const update = payload;
        if (!Object.keys(update).length) return;

        const type = event.startsWith("games.update.meta") ? "meta" : "state";

        game.hooks?.["games.update" + (type === "meta" ? ".meta" : "")]?.({ game, ws }, payload);

        const map = type === "meta" ? game.meta : game.state;
        const field = (getEventParam(event, ":") || "").replace("#" + name, "");

        // Meta[field] updates
        if (field) {
            Object.entries(update).map(([key, value]) => map.get(field).set(key, value));
        } else {
            // Meta updates
            Object.entries(update).map(([key, value]) => map.set(key, value));
        }

        return;
    }

    if (event.startsWith("games.delete")) {
        const name = getEventParam(event);
        if (!name) return;

        const room = games.get(name);
        games.delete(name);

        const timers = room.internal.get("timers") as Map<string, NodeJS.Timer>;
        timers.forEach((interval) => clearInterval(interval));
        timers.clear();

        broadcastSub("games", getGameRoomListEvent());
        return;
    }
}

// TODO rm + set void as return type for hooks
const update = (event: GameEvent, gameRoom: GameRoom, ws: AppWebsocket) => {
    const newCtx = gameRoom.hooks?.[event]?.({ ws, game: gameRoom });
    if (newCtx) {
        Object.entries(newCtx).forEach(([key, value]) => {
            gameRoom[key] = value;
        });
    }
};

export const hooksByGameName: Record<GameId, GameHooks> = {
    [GameId.Platformer]: platformerHooks,
};
