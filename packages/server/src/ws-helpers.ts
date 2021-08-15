import { WsEventPayload } from "./types";
import { TextEncoder, TextDecoder } from "util";
import WebSocket from "ws";

export const sendBinaryMsg = (ws: WebSocket, payload: WsEventPayload, opts?: any) =>
    ws.readyState === WebSocket.OPEN && ws.send(encode(payload), opts);
export const sendStrMsg = (ws: WebSocket, [event, data]: WsEventPayload, opts?: any) =>
    // @ts-ignore
    // console.log("<", [event, data]) ||
    ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify(event && data ? [event, data] : [event]), opts);

// TODO env var
export const sendMsg = sendStrMsg;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const encode = <Payload>(payload: Payload) => encoder.encode(JSON.stringify(payload));
export const decode = <Payload = any>(payload: ArrayBuffer | string): Payload => {
    try {
        const data = payload instanceof ArrayBuffer ? decoder.decode(payload) : payload;
        return JSON.parse(data);
    } catch (err) {
        return null;
    }
};
