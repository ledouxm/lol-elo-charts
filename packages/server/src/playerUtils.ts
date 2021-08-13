import { omit } from "@pastable/core";
import { AppWebsocket, ref } from "./app";

export const notifyDeparture = (ws: AppWebsocket) => {
    const fullPayloads = getFullPayload();
    const toSend = ws.id;

    withoutMe(fullPayloads, ws).forEach(({ client }) => {
        client.send(JSON.stringify(["LEFT", toSend]));
    });
};

export const notifyArrival = (ws: AppWebsocket) => {
    const fullPayloads = getFullPayload();
    const toSend = omit(onlyMe(fullPayloads, ws), ["client"]);

    withoutMe(fullPayloads, ws).forEach(({ client }) => {
        client.send(JSON.stringify(["NEW_PLAYER", toSend]));
    });
};

export const sendInitialPayload = (ws: AppWebsocket) => {
    const fullPayload = getFullPayload();

    ws.send(JSON.stringify(["INITIAL_PLAYERS", cleanPayloads(fullPayload, ws)]));
};

export const sendInitialMe = (ws: AppWebsocket) => {
    const fullPayload = onlyMe(withoutClient(getFullPayload()), ws);

    ws.send(JSON.stringify(["ME", fullPayload]));
};

export const getPayload = (type: PayloadType = "all") => {
    const values = [...ref.wss.clients.values()];

    const fullPayload = values.map((client) => ({
        client,
        id: client.id,
        ...(type !== "meta" && client.state),
        ...(type !== "state" && client.meta),
    }));

    return fullPayload;
};
export type Payload = AppWebsocket["state"] &
    AppWebsocket["meta"] & {
        client: AppWebsocket;
        id: string;
    };

export type PayloadType = "state" | "meta" | "all";

export const getFullPayload = getPayload;
export const getStatePayload = () => getPayload("state");
export const getMetaPayload = () => getPayload("meta");

export const onlyMe = (payloads: Partial<Payload>[], ws: AppWebsocket) =>
    payloads.find((client) => client.id === ws.id);
export const withoutMe = (payloads: Payload[], ws: AppWebsocket) => payloads.filter((client) => client.id !== ws.id);
export const withoutClient = (payloads: Payload[]) => payloads.map((payload) => omit(payload, ["client"]));
export const cleanPayloads = (payloads: Payload[], ws: AppWebsocket) => withoutClient(withoutMe(payloads, ws));

export const sendUpdate = (type: PayloadType, ws?: AppWebsocket) => {
    const payloads = type === "meta" ? getMetaPayload() : getStatePayload();
    (ws ? withoutMe(payloads, ws) : payloads).forEach((player) => {
        const playerPayload = cleanPayloads(payloads, player.client);
        player.client.send(JSON.stringify(["PLAYERS", playerPayload]));
    });
};

export const sendMetaUpdate = (ws: AppWebsocket) => sendUpdate("meta", ws);
export const sendStateUpdate = () => sendUpdate("state");
