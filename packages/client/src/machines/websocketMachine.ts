import { isDev } from "@pastable/core";
import { atom } from "jotai";
import { atomWithMachine } from "jotai/xstate";
import { InvokeCreator, assign, createMachine } from "xstate";

import { EventEmitter } from "@/functions/EventEmitter";
import { SocketReadyState, WsEvent, decode, encode } from "@/functions/ws";

// TODO: queue, send BaseSocketEvent when needed

const AUTO_RECO_DELAY = 10 * 1000;
export const createWebSocketMachine = () =>
    createMachine<WebSocketMachineContext, WebSocketMachineEvent>(
        {
            id: "websocket",
            initial: "closed",
            context: {
                socket: null,
                url: null,
                emitter: new EventEmitter(),
                error: null,
                retries: 0,
                options: defaultOptions,
            },
            states: {
                closed: {
                    on: { OPEN: { target: "open.pending", actions: ["setUrlAndOptions", "resetRetries"] } },
                    after: {
                        [AUTO_RECO_DELAY]: { target: "open.pending", actions: ["resetRetries"], cond: "canConnect" },
                    },
                },
                retrying: { after: { RETRIES_DELAY: { target: "open.pending", actions: "incrementRetries" } } },
                open: {
                    invoke: { id: "websocket", src: websocketService },
                    states: {
                        pending: {
                            on: {
                                OPENED: { target: "done", actions: "setSocket" },
                            },
                        },
                        done: {
                            entry: ["resetRetries"],
                            activities: "pinging",
                            on: {
                                EMIT: { actions: "emit" },
                                DISCONNECT: { target: "#websocket.closed", actions: "disconnect" },
                            },
                        },
                    },
                },
            },
            on: {
                CLOSE: [
                    { target: "retrying", cond: "canRetry" },
                    { target: "closed", actions: "closeWebSocket" },
                ],
            },
        },
        {
            actions: {
                setUrlAndOptions: assign({
                    url: (_ctx, event) => (event as OpenEvent).url,
                    options: (ctx, event) => (event as OpenEvent).options || ctx.options,
                }),
                incrementRetries: assign({ retries: (ctx) => ctx.retries + 1 }),
                resetRetries: assign({ retries: (_ctx) => 0 }),
                setSocket: assign({ socket: (_ctx, event) => (event as OpenedEvent).socket }),
                closeWebSocket: (ctx, _event) => close(ctx.socket),
                disconnect: (ctx: WebSocketMachineContext, event) => {
                    const { code, reason } = event as DisconnectEvent;

                    close(ctx.socket, code, reason);
                    ctx.emitter.removeAllListeners();
                },
                emit: (ctx, event) => emit({ ...(event as EmitEvent), ctx }),
            },
            guards: {
                canRetry: (ctx) => (ctx.options.maxRetries ? ctx.retries < ctx.options.maxRetries : true),
                canConnect: (ctx) => Boolean(ctx.url),
            },
            delays: {
                RETRIES_DELAY: (ctx, _event) => ctx.options.retriesDelay!,
            },
            activities: {
                pinging: (ctx) => {
                    const interval = setInterval(() => sendMsg(ctx.socket, ""), ctx.options.pingDelay);

                    return () => clearInterval(interval);
                },
            },
        }
    );
export const wsMachineAtom = atomWithMachine(() => createWebSocketMachine(), { devTools: isDev() });
export const wsStatusAtom = atom((get) => {
    const current = get(wsMachineAtom);
    if (current.matches("closed")) return "closed";
    if (current.matches("retrying") || current.matches("open.pending")) return "loading";
    if (current.matches("open.done")) return "open";
});

const sendMsg = (socket: WebSocket | null, message: any) =>
    socket && socket.readyState === SocketReadyState.OPEN && socket.send(message);
const close = (socket: WebSocket | null, code?: number, reason?: string) =>
    socket && socket.readyState === SocketReadyState.OPEN && socket.close(code, reason);

const websocketService: InvokeCreator<WebSocketMachineContext, WebSocketMachineEvent, any> =
    (ctx, _event) => (send, _onReceived) => {
        // Force new connection
        close(ctx.socket);
        ctx.emitter.dispatch(WsEvent.Connecting, true);

        try {
            const socket = new WebSocket(ctx.url!);
            socket.onopen = (event) => {
                send({ type: "OPENED", event, socket });
                ctx.emitter.dispatch(WsEvent.Connecting, false);
                ctx.emitter.dispatch(WsEvent.Open, event);
                if (ctx.retries) ctx.emitter.dispatch(WsEvent.Reconnected, event);
            };
            socket.onerror = (error) => {
                console.error("WebSocket error", error);
                ctx.emitter.dispatch(WsEvent.Error, event);
            };

            socket.onmessage = (event) => onMessage({ event, ctx });
            socket.onclose = (event) => {
                // console.log("WebSocket close", event);
                send({ type: "CLOSE", event });
                ctx.emitter.dispatch(WsEvent.Close, event);
            };
        } catch (error) {
            console.error(error);
            send({ type: "CLOSE", event: error });
            ctx.emitter.dispatch(WsEvent.Close, error);
        }
    };

/** Send [event, data] to server */
export function emit<Data = unknown, Event = unknown>({
    event,
    data,
    ctx,
}: {
    event: Event;
    data?: Data;
    ctx: WebSocketMachineContext;
}) {
    // Do not include a ",null" if data is undefined/null
    const payload = [event, data].filter((v) => v != null);
    // TODO [event, from: SocketId from nanoid/getRandomString, data?: optional]
    const msg = ctx.options.isBinary ? encode(payload) : JSON.stringify(payload);

    sendMsg(ctx.socket, msg);
}

async function onMessage({
    event: msgEvent,
    ctx,
}: {
    event: MessageEvent<ArrayBuffer | string>;
    ctx: WebSocketMachineContext;
}) {
    const length = msgEvent.data instanceof ArrayBuffer ? msgEvent.data.byteLength : msgEvent.data.length;
    // Most likely a "pong" response from our "ping" message
    if (!length) return;

    const message = await decode(msgEvent.data);
    // Invalid message
    if (!message) return;

    let event, data;
    if (Array.isArray(message)) {
        [event, data] = (message as [string, unknown]) || [];
    } else {
        const { type, ...rest } = message;
        event = type;
        data = rest;
    }

    ctx.emitter.dispatch(event, data);
    ctx.emitter.dispatch(WsEvent.Any, { event, data });
}

interface WebSocketMachineContext {
    socket: WebSocket | null;
    emitter: EventEmitter;
    /** WebSocket server URL */
    url: string | null;
    /** Connection error */
    error: string | null;
    options: WebSocketConnectOptions;
    retries: number;
    onOpen?: (event: Event) => void;
    onClose?: (event: CloseEvent) => void;
}

interface WebSocketConnectOptions {
    /** Delay in ms between reconnections attempts */
    retriesDelay?: number;
    /** Max attempts at reconnecting */
    maxRetries?: number;
    /** Delay in ms between each ping, to keep the connection alive */
    pingDelay?: number;
    isBinary?: boolean;
}

const defaultOptions: Partial<WebSocketConnectOptions> = {
    retriesDelay: 1000,
    maxRetries: 10,
    pingDelay: 20000,
    isBinary: false,
};

type OpenEvent = { type: "OPEN"; url: string; options?: WebSocketConnectOptions };
type EmitEvent = { type: "EMIT"; event: string; data: any };
type DisconnectEvent = { type: "DISCONNECT"; code?: number; reason?: string };
type CloseWsEvent = { type: "CLOSE"; event: CloseEvent };
type OpenedEvent = { type: "OPENED"; event: Event; socket: WebSocket };
type WebSocketMachineEvent = OpenEvent | EmitEvent | DisconnectEvent | CloseWsEvent | OpenedEvent;
