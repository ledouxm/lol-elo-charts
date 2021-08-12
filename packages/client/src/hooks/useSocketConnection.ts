import { getWebsocketURL, WsEvent } from "@/functions/ws";
import { emit, wsMachineAtom } from "@/machines/websocketMachine";
import { AnyFunction, isDev, useEvent } from "@pastable/core";
import { useAtom } from "jotai";
import { useEffect } from "react";

import { atom } from "jotai";

import { makeEventEmitterHook } from "@/functions/makeEventEmitterHook";
import { useAtomValue } from "jotai/utils";

const wsEmitterAtom = atom((get) => get(wsMachineAtom).context.emitter);
export const useSocketEvent = makeEventEmitterHook(wsEmitterAtom);
export const useSocketEmit = () => {
    const wsMachine = useAtomValue(wsMachineAtom);
    return (eventOrObj: string | { type: string; data?: any }, data?: any) => {
        const ctx = wsMachine.context;
        const payload =
            typeof eventOrObj === "string"
                ? { ctx, event: eventOrObj, data }
                : { ctx, event: eventOrObj.type, data: eventOrObj.data };
        emit<any, any>(payload);
    };
};
export type EventPayload = string | { type: string; data?: any };

export const useSocketConnection = () => {
    const [current, send] = useAtom(wsMachineAtom);
    const connectToWebsocket = () => {
        const url = getWebsocketURL() + "?" + new URLSearchParams({ auth: "chainbreak" }).toString();
        send({ type: "OPEN", url });
    };

    // Open websocket
    useEffect(connectToWebsocket, []);

    // Try to reconnect if ws is closed when focusing window
    useOnFocus(() => current.matches("closed") && connectToWebsocket());

    // Debug
    useSocketEvent(WsEvent.Any, (payload: { event: string; data: unknown }) => isDev() && console.log(payload));
};

const useOnFocus = (callback: AnyFunction) => {
    useEvent("visibilitychange" as any, callback);
    useEvent("focus" as any, callback);
};
