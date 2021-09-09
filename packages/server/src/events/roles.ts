import { getEventParam, isGlobalAdmin } from "../helpers";
import { EventHandlerRef } from "../types";
import { sendMsg } from "../ws-helpers";

export async function handleRolesEvent({ opts, event, payload, ws, users }: EventHandlerRef) {
    // ex: [roles.add#user123, "rooms.lobbyName.roleName"]
    // ex: [roles.delete#user123, ["games.gameRoomName.roleName", "rooms.admin"]]
    if (event.startsWith("roles.add") || event.startsWith("roles.delete")) {
        const clientId = getEventParam(event);
        if (!clientId) return sendMsg(ws, ["roles/missingName"], opts);

        if (!Array.isArray(payload) && typeof payload !== "string")
            return sendMsg(ws, ["roles/invalid", payload], opts);
        const sentRoles = Array.isArray(payload) ? payload : [payload];

        const canSet = isGlobalAdmin(ws);
        if (!canSet) return sendMsg(ws, ["roles/forbidden"], opts);

        const foundClient = users.get(clientId);
        if (!foundClient) return sendMsg(ws, ["roles/notFound", clientId], opts);

        const isAdd = event.startsWith("roles.add");
        if (isAdd) sentRoles.forEach((role) => foundClient.roles.add(role));
        else sentRoles.forEach((role) => foundClient.roles.delete(role));

        sendMsg(ws, ["roles/updated#" + clientId, Array.from(foundClient.roles)]);
    }

    // ex: [roles.get] // retrieve own roles
    // ex: [roles.get#user123]
    if (event.startsWith("roles.get")) {
        const clientId = getEventParam(event) || ws.id;

        const canGet = isGlobalAdmin(ws);
        if (!canGet) return sendMsg(ws, ["roles/forbidden"], opts);

        const foundClient = users.get(clientId);
        if (!foundClient) return sendMsg(ws, ["roles/notFound", clientId], opts);

        sendMsg(ws, ["roles/get#" + clientId, Array.from(foundClient.roles)]);
    }
}
