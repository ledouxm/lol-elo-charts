import { isDefined } from "@pastable/core";
import { platformerHooks } from "../games/platformer";
import {
    GameId,
    getEventParam,
    getEventSpecificParam,
    getGameFullState,
    getRoomClients,
    getRoomMeta,
    getRoomState,
    isIdInSet,
    makeGameRoom,
} from "../helpers";
import { EventHandlerRef, GameHooks } from "../types";
import { sendMsg } from "../ws-helpers";

export function handleGamesEvent({
    event,
    payload,
    ws,
    opts,
    client,
    games,
    broadcastSub,
    getGameRoomListEvent,
    sendGamesList,
}: EventHandlerRef) {
    // ex: [games.list]
    if (event.startsWith("games.list")) {
        return sendGamesList();
    }

    // ex: [games.create.platformer#abc123, { initial: 123 }]
    if (event.startsWith("games.create")) {
        const name = getEventParam(event);
        if (!name) return sendMsg(ws, ["games/missingName", name], opts);

        const gameId = getEventSpecificParam(event, name);
        if (!gameId) return sendMsg(ws, ["games/missingGameId", { name, gameId }], opts);

        if (games.get(name)) return sendMsg(ws, ["games/exists", name], opts);
        if (!Object.values(GameId).includes(gameId as any)) return sendMsg(ws, ["games/gameId.invalid", name], opts);

        const gameRoom = makeGameRoom({ name, state: payload, hooks: hooksByGameName[gameId] });
        gameRoom.clients.add(ws);

        games.set(name, gameRoom);
        client.rooms.add(gameRoom);
        gameRoom.hooks?.["games.create"]?.({ ws, game: gameRoom });

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

        sendMsg(ws, ["games/create#" + name]);
        broadcastSub("games", getGameRoomListEvent());
        return;
    }

    // ex: [games.join#abc123]
    if (event.startsWith("games.join")) {
        const name = getEventParam(event);
        if (!name) return;

        const gameRoom = games.get(name);
        if (!gameRoom) return sendMsg(ws, ["games/notFound", name], opts);
        if (isIdInSet(gameRoom.clients, ws.id)) return sendMsg(ws, ["games/alreadyIn", name], opts);

        const canJoin = gameRoom.hooks?.["games.before.join"]?.({ ws, game: gameRoom });
        if (isDefined(canJoin) && !canJoin) return sendMsg(ws, ["games/forbidden", name]);

        gameRoom.clients.add(ws);
        client.rooms.add(gameRoom);
        gameRoom.hooks?.["games.join"]?.({ ws, game: gameRoom });

        gameRoom.clients.forEach((client) => sendMsg(client, ["games/clients#" + name, getRoomClients(gameRoom)]));
        sendMsg(ws, ["games/join#" + gameRoom.name], opts);
        broadcastSub("games", getGameRoomListEvent());
        return;
    }

    // ex: [games.create.platformer#abc123]
    if (event.startsWith("games.get")) {
        const name = getEventParam(event);
        if (!name) return;

        const room = games.get(name);
        if (!room) return sendMsg(ws, ["games/notFound", name], opts);

        sendMsg(ws, ["games/u#" + name, getGameFullState(room)]);
        return;
    }

    // ex: [games.get.meta#abc123]
    // ex: [games.get.meta:field#abc123]
    // ex: [games.get.meta:field,another#abc123]
    if (event.startsWith("games.get.meta")) {
        const name = getEventParam(event);
        if (!name) return;

        const room = games.get(name);
        if (!room) return sendMsg(ws, ["games/notFound", name], opts);

        const fields = getEventSpecificParam(event, name).split(",");
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

    // ex: [games.leave#abc123]
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

    // ex: [games.kick#abc123, "userId"]
    if (event.startsWith("games.kick")) {
        const name = getEventParam(event);
        if (!name) return;

        const game = games.get(name);
        if (!game) return sendMsg(ws, ["games/notFound", name], opts);

        const foundWs = Array.from(game.clients).find((client) => client.id === payload);
        if (!foundWs) return sendMsg(ws, ["clients/notFound", name], opts);

        const canKick = game.hooks?.["games.before.join"]?.({ ws, game });
        if (isDefined(canKick) && !canKick) return sendMsg(ws, ["games/forbidden", name]);

        game.clients.delete(foundWs);
        foundWs.client.rooms.delete(game);

        sendMsg(foundWs, ["games/leave#" + name], opts);

        game.clients.forEach((client) => sendMsg(client, ["games/clients#" + name, getRoomClients(game)]));

        broadcastSub("rooms", getGameRoomListEvent());
        return;
    }

    // ex: [games.update#abc123, { aaa: 456, zzz: 111 }]
    // ex: [games.update.meta#abc123, { aaa: 456, zzz: 111 }]
    // ex: [games.update:statemap#abc123, { nestedKey: 222 }]
    if (event.startsWith("games.update")) {
        const name = getEventParam(event);
        if (!name) return;

        const game = games.get(name);
        if (!game) return sendMsg(ws, ["games/notFound", name], opts);
        if (!Object.keys(payload).length) return;

        const type = event.startsWith("games.update.meta") ? "meta" : "state";

        game.hooks?.["games.update" + (type === "meta" ? ".meta" : "")]?.({ game, ws }, payload);

        const map = type === "meta" ? game.meta : game.state;
        const field = getEventSpecificParam(event, name);

        // Meta[field] updates
        if (field) {
            // TODO gérer les objets aussi pas juste les maps + les nested path comme rooms.update
            Object.entries(payload).map(([key, value]) => map.get(field).set(key, value));
        } else {
            // Meta updates
            Object.entries(payload).map(([key, value]) => map.set(key, value));
        }

        return;
    }

    // ex: [games.delete#abc123]
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

export const hooksByGameName: Record<GameId, GameHooks> = {
    [GameId.Platformer]: platformerHooks,
};
