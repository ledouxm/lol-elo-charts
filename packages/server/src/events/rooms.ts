import { safeJSONParse } from "@pastable/core";
import { makeRoom, getRoomFullState, getEventParam, isUserInSet, getRoomState } from "../helpers";
import { AppWebsocket, EventHandlerRef } from "../types";
import { sendMsg } from "../ws-helpers";

export function handleRoomsEvent({
    event,
    payload,
    ws,
    opts,
    user,
    rooms,
    broadcastEvent,
    broadcastSub,
    getRoomListEvent,
    sendRoomsList,
    onJoinRoom,
}: EventHandlerRef) {
    if (event.startsWith("rooms.list")) {
        return sendRoomsList();
    }

    if (event.startsWith("rooms.create")) {
        const name = getEventParam(event);
        if (!name) return;
        if (rooms.get(name)) return sendMsg(ws, ["rooms/exists", name], opts);

        const room = makeRoom({ name, state: payload });
        room.clients.add(ws);
        rooms.set(name, room);
        user.rooms.add(room);

        const sendFullState = (client: AppWebsocket) =>
            sendMsg(client, ["rooms/state#" + name, getRoomFullState(room)]);
        const fullStateRefreshInterval = setInterval(
            () => room.clients.forEach((client) => sendFullState(client)),
            room.config.updateRate
        );
        const timers = room.internal.get("timers") as Map<string, NodeJS.Timer>;
        timers.set("fullState", fullStateRefreshInterval);

        broadcastEvent(room, event);
        broadcastSub("rooms", getRoomListEvent());
        onJoinRoom(room);
        sendFullState(ws);
        return;
    }

    if (event.startsWith("rooms.join")) {
        const name = getEventParam(event);
        if (!name) return;

        const room = rooms.get(name);
        if (!room) return sendMsg(ws, ["rooms/notFound", name], opts);
        if (isUserInSet(room.clients, ws.id)) return;

        room.clients.add(ws);
        user.rooms.add(room);
        onJoinRoom(room);
        return;
    }

    // TODO can only update room if in it ? -> room.config + permissions
    if (event.startsWith("rooms.update")) {
        const name = getEventParam(event);
        if (!name) return;

        const room = rooms.get(name);
        if (!room) return sendMsg(ws, ["rooms/notFound", name], opts);

        const update = safeJSONParse(payload) || {};
        if (!Object.keys(update).length) return;

        Object.entries(update).map(([key, value]) => room.state.set(key, value));

        broadcastEvent(room, event, update);
        return;
    }

    if (event.startsWith("rooms.get")) {
        const name = getEventParam(event);
        if (!name) return;

        const room = rooms.get(name);
        if (!room) return sendMsg(ws, ["rooms/notFound", name], opts);

        sendMsg(ws, ["rooms/state#" + name, getRoomFullState(room)]);
        return;
    }

    if (event.startsWith("rooms.leave")) {
        const name = getEventParam(event);
        if (!name) return;

        const room = rooms.get(name);
        if (!room) return sendMsg(ws, ["games/notFound", name], opts);

        room.clients.delete(ws);
        user.rooms.delete(room);

        sendMsg(ws, ["rooms/leave#" + name], opts);
        broadcastSub("rooms", getRoomListEvent());
        return;
    }

    if (event.startsWith("rooms.kick")) {
        const name = getEventParam(event);
        if (!name) return;

        const room = rooms.get(name);
        if (!room) return sendMsg(ws, ["games/notFound", name], opts);

        // TODO check permissions
        const client = Array.from(room.clients).find((client) => client.id === payload);
        if (!client) return sendMsg(ws, ["clients/notFound", name], opts);

        room.clients.delete(client);
        client.user.rooms.delete(room);

        sendMsg(client, ["rooms/leave#" + name], opts);
        // TODO prévenir les autres joueurs de la room
        broadcastSub("rooms", getRoomListEvent());
        return;
    }

    if (event.startsWith("rooms.delete")) {
        const name = getEventParam(event);
        if (!name) return;

        const room = rooms.get(name);
        rooms.delete(name);

        const timers = room.internal.get("timers") as Map<string, NodeJS.Timer>;
        timers.forEach((interval) => clearInterval(interval));
        timers.clear();

        room.clients.forEach((client) => sendMsg(client, ["rooms/delete#" + name]));
        console.log(room.clients);
        broadcastSub("rooms", getRoomListEvent());
        return;
    }

    if (event.startsWith("rooms.relay")) {
        if (!Array.isArray(payload.data)) return;

        const name = getEventParam(event);
        if (!name) return;

        const room = rooms.get(name);
        if (!room) return sendMsg(ws, ["rooms/notFound", name], opts);
        if (!Array.isArray(payload.data)) return;

        room.clients.forEach((client) => sendMsg(client, payload.data, opts));
        return;
    }

    if (event.startsWith("rooms.broadcast")) {
        if (!Array.isArray(payload.data)) return;

        const name = getEventParam(event);
        if (!name) return;

        const room = rooms.get(name);
        if (!room) return sendMsg(ws, ["rooms/notFound", name], opts);

        room.clients.forEach((client) => ws !== client && sendMsg(client, payload.data, opts));
        return;
    }
}
