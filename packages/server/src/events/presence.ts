import { getClientMeta, getClientState, getEventParam, getEventSpecificParam } from "../helpers";
import { EventHandlerRef, GlobalSubscription, WsEventPayload } from "../types";
import { sendMsg } from "../ws-helpers";

export function handlePresenceEvents({
    opts,
    event,
    payload,
    ws,
    user,
    rooms,
    games,
    users,
    globalSubscriptions,
    sendPresenceList,
    getPresenceMetaList,
    broadcastPresenceList,
    getPresenceList,
    sendGamesList,
    broadcastEvent,
    sendRoomsList,
}: EventHandlerRef) {
    // ex: [sub.rooms]
    if (event.startsWith("sub")) {
        const type = getEventParam(event) as GlobalSubscription;
        if (!type) return;

        const sub = globalSubscriptions.get(type);
        if (!sub) return;

        sub.add(ws);

        const timers = ws.internal.get("timers") as Map<GlobalSubscription, NodeJS.Timer>;
        if (type === "presence") {
            timers.set(type, setInterval(sendPresenceList, 10 * 1000));
            return sendPresenceList();
        }

        if (type === "rooms") {
            timers.set(type, setInterval(sendRoomsList, 10 * 1000));
            return sendRoomsList();
        }

        if (type === "games") {
            timers.set(type, setInterval(sendGamesList, 10 * 1000));
            return sendGamesList();
        }
    }

    // ex: [unsub.rooms]
    if (event.startsWith("unsub")) {
        const type = getEventParam(event) as GlobalSubscription;
        if (!type) return;

        const sub = globalSubscriptions.get(type);
        if (!sub) return;

        sub.delete(ws);

        const timers = ws.internal.get("timers") as Map<GlobalSubscription, NodeJS.Timer>;
        clearInterval(timers.get(type));
        timers.delete(type);
    }

    // ex: [presence.update, { color: "#000000" }]
    if (event.startsWith("presence.update")) {
        if (!payload) return;
        const type = getEventParam(event);
        const map = type === "meta" ? ws.meta : ws.state;

        Object.entries(payload).map(([key, value]) => map.set(key, value));

        if (type === "meta") {
            const listEvent = ["presence/list#meta", getPresenceMetaList()] as WsEventPayload;
            globalSubscriptions.get("presence").forEach((client) => client !== ws && sendMsg(client, listEvent));
            user.rooms.forEach((room) => broadcastEvent(room, listEvent[0], listEvent[1]));
        } else {
            broadcastPresenceList();
            const list = getPresenceList();

            // Notify everyone that has a common room with the user who updated its presence
            // Except the ones that were already notified since they are sub'd to the global presence
            user.rooms.forEach((room) =>
                room.clients.forEach((client) => {
                    if (globalSubscriptions.get("presence").has(client)) return;
                    sendMsg(client, ["presence/list", list]);
                })
            );
        }

        return;
    }

    if (event.startsWith("presence.list")) {
        return sendPresenceList();
    }

    // ex: [presence.get#user123]
    // ex: [presence.get:meta#user123]
    if (event.startsWith("presence.get")) {
        const clientId = getEventParam(event);
        if (!clientId) return;

        const user = users.get(ws.id);
        if (!user) return sendMsg(ws, ["presence/notFound", clientId], opts);

        const type = getEventSpecificParam(event, clientId) || "state";
        if (!Boolean(["state", "meta"].includes(type))) return sendMsg(ws, ["presence/get.invalid", clientId], opts);

        const client = Array.from(user.clients)[0];
        if (!client) sendMsg(ws, ["presence/offline", clientId], opts);

        sendMsg(ws, [
            `presence/${type}#` + clientId,
            type === "state" ? getClientState(client) : getClientMeta(client),
        ]);
        return;
    }

    // ex: [roles.add:games#abc123, admin]
    if (event.startsWith("roles.")) {
        const name = getEventParam(event);
        if (!name) return;

        const type = getEventSpecificParam(event, name);
        if (!type) return;

        const room = type === "rooms" ? rooms.get(name) : games.get(name);
        if (!room) return sendMsg(ws, [type + "/notFound", name]);

        const canSet = ws.roles.has("admin") || ws.roles.has(`${type}.${room.name}.admin`);
        if (!canSet) return sendMsg(ws, [type + "/forbidden", name]);

        const isAdd = event.startsWith("roles.add");
        if (isAdd) ws.roles.add(`${type}.${room.name}.${payload}`);
        else ws.roles.delete(`${type}.${room.name}.${payload}`);
    }
}
