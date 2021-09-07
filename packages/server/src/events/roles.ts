import { getEventParam } from "../helpers";
import { EventHandlerRef } from "../types";
import { sendMsg } from "../ws-helpers";

export function handleRolesEvent({ opts, event, payload, ws, users }: EventHandlerRef) {
    // ex: [roles.add#user123, "rooms.lobbyName.roleName"]
    // ex: [roles.delete#user123, ["games.gameRoomName.roleName", "rooms.admin"]]
    if (event.startsWith("roles.add") || event.startsWith("roles.delete")) {
        const clientId = getEventParam(event);
        if (!clientId) return sendMsg(ws, ["roles/missingName"], opts);

        const canSet = ws.roles.has("admin");
        if (!canSet) return sendMsg(ws, ["roles/forbidden"], opts);

        const foundUser = users.get(clientId);
        if (!foundUser) return sendMsg(ws, ["roles/notFound", clientId], opts);
        if (!Array.isArray(payload) && typeof payload !== "string")
            return sendMsg(ws, ["roles/invalid", payload], opts);
        const roles = Array.isArray(payload) ? payload : [payload];

        const isAdd = event.startsWith("roles.add");
        if (isAdd) roles.forEach((role) => foundUser.roles.add(role));
        else roles.forEach((role) => foundUser.roles.delete(role));

        sendMsg(ws, ["roles/updated#" + clientId, Array.from(foundUser.roles)]);
    }

    // ex: [roles.get] // retrieve own roles
    // ex: [roles.get#user123]
    if (event.startsWith("roles.get")) {
        const clientId = getEventParam(event) || ws.id;

        const canGet = ws.roles.has("admin");
        if (!canGet) return sendMsg(ws, ["roles/forbidden"], opts);

        const foundUser = users.get(clientId);
        if (!foundUser) return sendMsg(ws, ["roles/notFound", clientId], opts);

        sendMsg(ws, ["roles/get#" + clientId, Array.from(foundUser.roles)]);
    }
}
