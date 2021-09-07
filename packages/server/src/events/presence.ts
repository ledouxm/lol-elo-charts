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
    sendGamesList,
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
            const listEvent = ["presence/list:meta", getPresenceMetaList()] as WsEventPayload;
            globalSubscriptions.get("presence").forEach((client) => client !== ws && sendMsg(client, listEvent));

            // Same as below
            user.rooms.forEach((room) => {
                room.clients.forEach((client) => {
                    if (globalSubscriptions.get("presence").has(client)) return;
                    sendMsg(client, ["rooms/presence#" + room.name, Array.from(room.clients).map(getClientMeta)]);
                });
            });
        } else {
            broadcastPresenceList();

            // Notify everyone that has a common room with the user who updated its presence
            // Except the ones that were already notified since they are sub'd to the global presence
            user.rooms.forEach((room) => {
                room.clients.forEach((client) => {
                    if (globalSubscriptions.get("presence").has(client)) return;
                    sendMsg(client, ["rooms/presence#" + room.name, Array.from(room.clients).map(getClientState)]);
                });
            });
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

        const type = getEventSpecificParam(event, clientId) || "state";
        if (!Boolean(["state", "meta"].includes(type))) return sendMsg(ws, ["presence/get.invalid", clientId], opts);

        const foundUser = users.get(clientId);
        if (!foundUser) return sendMsg(ws, ["presence/notFound", clientId], opts);

        const foundClient = Array.from(foundUser.clients)[0];
        if (!foundClient) sendMsg(ws, ["presence/offline", clientId], opts);

        sendMsg(ws, [
            `presence/${type}#` + clientId,
            type === "state" ? getClientState(foundClient) : getClientMeta(foundClient),
        ]);
        return;
    }
}
