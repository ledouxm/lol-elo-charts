import { lobbyHooks } from "@/rooms/lobby";
import { isDefined, set } from "@pastable/core";
import {
    getEventParam,
    getEventSpecificParam,
    getRoomClients,
    getRoomState,
    isGlobalAdmin,
    isIdInSet,
    makeRoom,
} from "../helpers";
import { AppWebsocket, EventHandlerRef, RoomHooks, WsEventPayload } from "../types";
import { sendMsg } from "../ws-helpers";

export function handleRoomsEvent({
    event,
    payload,
    ws,
    opts,
    client,
    rooms,
    broadcastEvent,
    broadcastSub,
    getRoomListEvent,
    sendRoomsList,
    onJoinRoom,
}: EventHandlerRef) {
    // ex: [rooms.list]
    if (event.startsWith("rooms.list")) {
        return sendRoomsList();
    }

    // ex: [rooms.create#abc123, { initial: 123 }]
    // ex: [rooms.create.lobby#abc123, { initial: 123 }]
    if (event.startsWith("rooms.create")) {
        const name = getEventParam(event);
        if (!name) return sendMsg(ws, ["rooms/missingName", name], opts);

        const roomId = getEventSpecificParam(event, name) || "lobby";
        if (!roomId) return sendMsg(ws, ["rooms/missingRoomId", { name, roomId }], opts);
        if (rooms.get(name)) return sendMsg(ws, ["rooms/exists", name], opts);

        const room = makeRoom({ name, state: payload, hooks: roomId ? hooksByRoomId[roomId] : null });

        room.clients.add(ws);
        rooms.set(name, room);
        client.rooms.add(room);

        room.hooks?.["rooms.create"]?.({ room, ws });

        const sendFullState = (client: AppWebsocket) => sendMsg(client, ["rooms/state#" + name, getRoomState(room)]);
        const sendPresenceList = (client: AppWebsocket) =>
            sendMsg(client, ["rooms/presence#" + name, getRoomClients(room)]);
        const fullStateRefreshInterval = setInterval(() => {
            room.clients.forEach((client) => {
                sendPresenceList(client);
                sendFullState(client);
            });
            room.watchers.forEach((client) => {
                sendPresenceList(client);
                sendFullState(client);
            });
        }, room.config.updateRate);
        const timers = room.internal.get("timers") as Map<string, NodeJS.Timer>;
        timers.set("fullState", fullStateRefreshInterval);

        broadcastEvent(room, event);
        broadcastSub("rooms", getRoomListEvent());
        onJoinRoom(room);
        sendFullState(ws);
        return;
    }

    // ex: [rooms.join#abc123]
    if (event.startsWith("rooms.join")) {
        const name = getEventParam(event);
        if (!name) return;

        const room = rooms.get(name);
        if (!room) return sendMsg(ws, ["rooms/notFound", name], opts);
        if (isIdInSet(room.clients, ws.id)) return sendMsg(ws, ["rooms/alreadyIn", name], opts);

        const canJoin = room.hooks?.["rooms.before.join"]?.({ room, ws });
        if (isDefined(canJoin) && !canJoin) return sendMsg(ws, ["rooms/forbidden", name]);

        room.clients.add(ws);
        client.rooms.add(room);
        onJoinRoom(room);
        room.hooks?.["rooms.join"]?.({ room, ws });

        return;
    }

    // ex: [rooms.watch#abc123]
    if (event.startsWith("rooms.watch")) {
        const name = getEventParam(event);
        if (!name) return;

        const room = rooms.get(name);
        if (!room) return sendMsg(ws, ["rooms/notFound", name], opts);
        if (room.watchers.has(ws)) return sendMsg(ws, ["rooms/alreadyWatching", name], opts);

        room.watchers.add(ws);
        sendMsg(ws, ["rooms/presence#" + name, getRoomClients(room)]);
        sendMsg(ws, ["rooms/state#" + name, getRoomState(room)]);

        return;
    }

    // ex: [rooms.unwatch#abc123]
    if (event.startsWith("rooms.unwatch")) {
        const name = getEventParam(event);
        if (!name) return;

        const room = rooms.get(name);
        if (!room) return sendMsg(ws, ["rooms/notFound", name], opts);
        if (!room.watchers.has(ws)) return sendMsg(ws, ["rooms/notWatching", name], opts);

        room.watchers.delete(ws);

        return;
    }

    // ex: [rooms.update#abc123, { aaa: 111, "nested.key": 222 }]
    if (event.startsWith("rooms.update")) {
        const name = getEventParam(event);
        if (!name) return sendMsg(ws, ["rooms/missingName", name], opts);

        const room = rooms.get(name);
        if (!room) return sendMsg(ws, ["rooms/notFound", name], opts);

        const isAdmin = isGlobalAdmin(ws);
        // Only admins can update a room without being in it
        if (!isAdmin && !room.clients.has(ws)) return sendMsg(ws, ["rooms/update.empty", name], opts);

        const field = getEventSpecificParam(event, name);
        const canUpdate = isAdmin || room.hooks?.["rooms.before.update"]?.({ room, ws, field }, payload);
        if (isDefined(canUpdate) && !canUpdate) return sendMsg(ws, ["rooms/forbidden", name]);

        if (field) {
            const paths = field.split(".");
            const first = paths[0];

            // Set nested key
            // [rooms.update:votes.userId#abc123, "Platformer"]
            if (paths.length > 1) {
                const first = paths[0];
                const prop = room.state.get(first);
                const clone = { ...prop };

                set(clone, paths.slice(1).join("."), payload);
                room.state.set(first, clone);
            } else {
                // [rooms.update:common#abc123, "thing"]
                room.state.set(first, payload);
            }
        } else {
            if (!Object.keys(payload).length) return sendMsg(ws, ["rooms/update.invalid", name], opts);

            // [rooms.update#abc123, { aaa: 111, "nested.key": 222 }]
            Object.entries(payload).map(([key, value]) => {
                const paths = key.split(".");

                // Set nested key
                if (paths.length > 1) {
                    const first = paths[0];
                    const prop = room.state.get(first);
                    const clone = { ...prop };

                    set(clone, paths.slice(1).join("."), value);
                    room.state.set(first, clone);
                } else {
                    room.state.set(key, value);
                }
            });
        }

        room.hooks?.["rooms.update"]?.({ room, ws, event, field, broadcastEvent });

        broadcastEvent(room, event, payload);

        // Watchers are not in the room as participants but still want to receive updates
        const sendFullState = (client: AppWebsocket) => sendMsg(client, ["rooms/state#" + name, getRoomState(room)]);
        room.watchers.forEach(sendFullState);

        return;
    }

    // ex: [rooms.get#abc123]
    if (event.startsWith("rooms.get")) {
        const name = getEventParam(event);
        if (!name) return;

        const room = rooms.get(name);
        if (!room) return sendMsg(ws, ["rooms/notFound", name], opts);

        sendMsg(ws, ["rooms/presence#" + name, getRoomClients(room)]);
        sendMsg(ws, ["rooms/state#" + name, getRoomState(room)]);
        return;
    }

    // ex: [rooms.leave#abc123]
    if (event.startsWith("rooms.leave")) {
        const name = getEventParam(event);
        if (!name) return;

        const room = rooms.get(name);
        if (!room) return sendMsg(ws, ["games/notFound", name], opts);

        room.clients.delete(ws);
        client.rooms.delete(room);

        room.hooks?.["rooms.leave"]?.({ room, ws });

        sendMsg(ws, ["rooms/leave#" + name], opts);
        const presenceEvent = ["rooms/presence#" + room.name, getRoomClients(room)] as WsEventPayload;
        room.clients.forEach((client) => sendMsg(client, presenceEvent));
        room.watchers.forEach((client) => sendMsg(client, presenceEvent));
        broadcastSub("rooms", getRoomListEvent());
        return;
    }

    // ex: [rooms.kick#abc123, "userId"]
    if (event.startsWith("rooms.kick")) {
        const name = getEventParam(event);
        if (!name) return;

        const room = rooms.get(name);
        if (!room) return sendMsg(ws, ["games/notFound", name], opts);

        const foundWs = Array.from(room.clients).find((client) => client.id === payload);
        if (!foundWs) return sendMsg(ws, ["clients/notFound", name], opts);

        const canKick = room.hooks?.["rooms.before.kick"]?.({ room, ws });
        if (isDefined(canKick) && !canKick) return sendMsg(ws, ["rooms/forbidden", name]);

        room.clients.delete(foundWs);
        foundWs.client.rooms.delete(room);

        room.hooks?.["rooms.kick"]?.({ room, ws });

        sendMsg(foundWs, ["rooms/leave#" + name], opts);
        const presenceEvent = ["rooms/presence#" + room.name, getRoomClients(room)] as WsEventPayload;
        room.clients.forEach((client) => sendMsg(client, presenceEvent));
        room.watchers.forEach((client) => sendMsg(client, presenceEvent));
        broadcastSub("rooms", getRoomListEvent());
        return;
    }

    // ex: [rooms.delete#abc123]
    if (event.startsWith("rooms.delete")) {
        const name = getEventParam(event);
        if (!name) return;

        const room = rooms.get(name);
        const canDelete = room.hooks?.["rooms.before.delete"]?.({ room, ws });
        if (isDefined(canDelete) && !canDelete) return sendMsg(ws, ["rooms/forbidden", name]);

        rooms.delete(name);

        const timers = room.internal.get("timers") as Map<string, NodeJS.Timer>;
        timers.forEach((interval) => clearInterval(interval));
        timers.clear();

        room.hooks?.["rooms.delete"]?.({ room, ws });

        room.clients.forEach((client) => sendMsg(client, ["rooms/delete#" + name]));
        broadcastSub("rooms", getRoomListEvent());
        return;
    }

    // ex: [rooms.relay#abc123, any]
    if (event.startsWith("rooms.relay")) {
        if (!Array.isArray(payload)) return;

        const name = getEventParam(event);
        if (!name) return;

        const room = rooms.get(name);
        if (!room) return sendMsg(ws, ["rooms/notFound", name], opts);

        room.clients.forEach((client) => sendMsg(client, payload as any, opts));
        return;
    }

    // ex: [rooms.broadcast#abc123, any]
    if (event.startsWith("rooms.broadcast")) {
        if (!Array.isArray(payload)) return;

        const name = getEventParam(event);
        if (!name) return;

        const room = rooms.get(name);
        if (!room) return sendMsg(ws, ["rooms/notFound", name], opts);

        room.clients.forEach((client) => ws !== client && sendMsg(client, payload as any, opts));
        return;
    }

    if (event.startsWith("rooms.any")) {
        const name = getEventParam(event);
        if (!name) return;

        const room = rooms.get(name);
        if (!room) return sendMsg(ws, ["rooms/notFound", name], opts);

        room.hooks?.[event]?.({ room, ws });
        return;
    }
}

export const hooksByRoomId: Record<string, RoomHooks> = {
    lobby: lobbyHooks,
};
