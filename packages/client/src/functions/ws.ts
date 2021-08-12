const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const encode = <Payload>(payload: Payload) => encoder.encode(JSON.stringify(payload));
export const decode = async <Payload = any>(payload: ArrayBuffer | string): Promise<Payload> => {
    try {
        const data = payload instanceof ArrayBuffer ? decoder.decode(payload) : payload;
        return JSON.parse(data);
    } catch (err) {
        return null as any;
    }
};

export const serialize = (data: Record<string, any>) => {
    let payload: Record<string, any> = {};
    for (const key in data) {
        if (typeof data[key] === "object") {
            payload[key] = JSON.stringify(data[key]);
        } else {
            payload[key] = data[key];
        }
    }

    return payload;
};

export const getWebsocketURL = () => (import.meta.env.VITE_BACKEND_WS_URL as string) || "ws://localhost:1338";

// https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
export enum SocketReadyState {
    CONNECTING,
    OPEN,
    CLOSING,
    CLOSED,
}

export enum WsEvent {
    Connecting = "_connecting_",
    Open = "open",
    Close = "close",
    Error = "error",
    Any = "_msg_",
    Reconnected = "_reconnected_",
}
