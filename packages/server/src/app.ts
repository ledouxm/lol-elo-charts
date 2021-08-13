import { wait } from "@pastable/core";
import { getRandomColor } from "./colorUtils";
import { changeHexStatus, sendInitialHexagons } from "./hexagonUtils";
import http from "http";
import { nanoid } from "nanoid";
import {
    notifyArrival,
    notifyDeparture,
    sendInitialMe,
    sendInitialPayload,
    sendMetaUpdate,
    sendStateUpdate,
} from "./playerUtils";
import { URL } from "url";
import WebSocket from "ws";

// const playersMap = new Map<string, { ws: AppWebsocket; position: number[]; rotation: number[]; id: string }>();
type AppSocketServer = Omit<WebSocket.Server, "clients"> & { clients: Set<AppWebsocket> };
export const ref = {
    wss: null as AppSocketServer,
};

export const makeWs = (options: WebSocket.ServerOptions) => {
    ref.wss = new WebSocket.Server(options) as AppSocketServer;

    ref.wss.on("connection", (ws: AppWebsocket, req) => {
        console.log("relay connection", req.url);

        const isValid = isAuthValid(ws, req);
        if (!isValid) return;

        const id = nanoid(12);
        ws.id = id;
        const state = {
            position: [0, 0, 0],
            rotation: [0, 0, 0],
        };
        const meta = {
            color: getRandomColor(),
        };
        ws.state = state;
        ws.meta = meta;

        sendInitialPayload(ws);
        sendInitialHexagons(ws);
        sendInitialMe(ws);

        notifyArrival(ws);

        ws.isAlive = true;
        ws.on("pong", () => (ws.isAlive = true));

        ws.on("message", (rawData: any, isBinary: boolean) => {
            try {
                const data = JSON.parse(rawData);
                const [type, event] = data;
                switch (type) {
                    case "RELAY":
                        ref.wss.clients.forEach((client) => {
                            if (client === ws || client.readyState !== WebSocket.OPEN) return;

                            client.send(data, { binary: isBinary });
                        });
                        break;
                    case "META":
                        Object.entries(event).forEach(([key, value]) => (ws.meta[key] = value));
                        sendMetaUpdate(ws);
                        break;
                    case "STATE":
                        const [position, rotation] = event;

                        ws.state.position = position;
                        ws.state.rotation = rotation;

                        break;
                    case "H":
                        changeHexStatus(event, ws);
                        break;

                    default:
                        console.log(
                            (Array.from(ref.wss.clients.values()) as AppWebsocket[]).map(({ state, id }) => ({
                                id,
                                rotation: state.rotation,
                                position: state.position,
                            }))
                        );
                }
            } catch (e) {}
        });

        ws.on("close", () => {
            notifyDeparture(ws);
        });
    });

    const interval = setInterval(() => {
        ref.wss.clients.forEach((ws: AppWebsocket) => {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping(noop);
        });
    }, 30000);

    ref.wss.on("close", () => clearInterval(interval));

    return ref.wss;
};

const tick = 1000 / 32;
export const startTicking = () => {
    const interval = setInterval(() => {
        sendStateUpdate();
    }, tick);

    return () => clearInterval(interval);
};

function noop() {}
export type AppWebsocket = WebSocket & {
    isAlive?: boolean;
    id?: string;
    state?: {
        position?: number[];
        rotation?: number[];
    };
    meta: {
        color?: string;
    };
};

const pw = "chainbreak";
const isAuthValid = async (ws: WebSocket, req: http.IncomingMessage) => {
    const url = new URL((req.url.startsWith("/") ? "http://localhost" : "") + req.url);
    const auth = url.searchParams.get("auth");
    if (auth !== pw) {
        // cheap rate-limiting
        await wait(2000);
        ws.close();
        return false;
    }

    return true;
};
