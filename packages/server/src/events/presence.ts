import { getEventParam } from "../helpers";
import { EventHandlerRef, GlobalSubscription, WsEventPayload } from "../types";
import { sendMsg } from "../ws-helpers";

export function handlePresenceEvents({
    event,
    payload,
    ws,
    user,
    globalSubscriptions,
    sendPresenceList,
    getPresenceMetaList,
    broadcastPresenceList,
    getPresenceList,
    sendGamesList,
    broadcastEvent,
    sendRoomsList,
}: EventHandlerRef) {
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

    if (event.startsWith("sub")) {
        const type = getEventParam(event) as GlobalSubscription;
        if (!type) return;

        const sub = globalSubscriptions.get(type);
        if (!sub) return;

        sub.delete(ws);

        const timers = ws.internal.get("timers") as Map<GlobalSubscription, NodeJS.Timer>;
        clearInterval(timers.get(type));
        timers.delete(type);
    }

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
}
