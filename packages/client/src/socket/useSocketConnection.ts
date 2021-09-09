import { getWebsocketURL, WsEvent } from "@/socket/ws";
import { emit, wsMachineAtom, wsStatusAtom } from "@/socket/websocketMachine";
import { AnyFunction, isDev, ObjectLiteral, useEvent } from "@pastable/core";
import { useAtom } from "jotai";
import { useEffect } from "react";

import { atom } from "jotai";

import { makeEventEmitterHook } from "@/functions/makeEventEmitterHook";
import { useAtomValue } from "jotai/utils";

const wsEmitterAtom = atom((get) => get(wsMachineAtom).context.emitter);
export const useSocketEventEmitter = () => useAtomValue(wsEmitterAtom);
export const useSocketEvent = makeEventEmitterHook(wsEmitterAtom);

export const useSocketEmit = () => {
    const wsMachine = useAtomValue(wsMachineAtom);
    return <Data = any>(eventOrObj: string | { type: string; data?: Data }, data?: Data) => {
        const ctx = wsMachine.context;
        const payload =
            typeof eventOrObj === "string"
                ? { ctx, event: eventOrObj, data }
                : { ctx, event: eventOrObj.type, data: eventOrObj.data };
        emit<Data, any>(payload);
    };
};
export type EventPayload = string | { type: string; data?: any };

export const useSocketStatus = () => useAtomValue(wsStatusAtom);

const withLogs = false && isDev();
const makeUrl = (params: ObjectLiteral) => getWebsocketURL() + "?" + new URLSearchParams(params).toString();

export const useSocketConnection = (params?: ObjectLiteral) => {
    const [current, send] = useAtom(wsMachineAtom);
    const connectToWebsocket = (type: any = "OPEN") => send({ type, url: makeUrl(params) });

    // Open websocket
    useEffect(() => {
        if (!Object.keys(params || {}).length) return;

        if (current.matches("closed")) {
            connectToWebsocket();
        } else {
            connectToWebsocket("SET_URL");
        }
    }, [params]);

    // Try to reconnect if ws is closed when focusing window (and that is not the first time we try to connect)
    useOnFocus(() => current.matches("closed") && current.context.socket && connectToWebsocket());

    // Debug
    useSocketEvent(WsEvent.Any, (payload: { event: string; data: unknown }) => withLogs && console.log(payload));
};

const useOnFocus = (callback: AnyFunction) => {
    useEvent("visibilitychange" as any, callback);
    useEvent("focus" as any, callback);
};
