import fastify from "fastify";
import WebSocket from "ws";
import http from "http";
import { URL } from "url";
import { wait } from "@pastable/core";
import { TextDecoder, TextEncoder } from "util";

export const makeApp = () => {
    const app = fastify({ logger: true });
    // serverFactory

    app.get("/", async (request, reply) => {
        return { hello: "world" };
    });

    return app;
};

const serverFactory = (handler, opts) => {
    const server = http.createServer(handler);
    // server.on('upgrade', (request, socket, head) => {
    //     const handleAuth = ws => {
    //       wss.emit('connection', ws, request)
    //     }
    //     wss.handleUpgrade(request, socket, head, handleAuth)
    //   })

    return server;
};

const setupWSConnection = require("./y-websocket").setupWSConnection;
export const makeYjsWs = (options: WebSocket.ServerOptions) => {
    console.log(setupWSConnection);
    const wss = new WebSocket.Server(options);

    wss.on("connection", (ws, req) => {
        const isValid = isAuthValid(ws, req);
        if (!isValid) return;

        setupWSConnection(ws, req, {
            gc: (req.url || "").slice(1) !== "prosemirror-versions",
        });
    });

    return wss;
};

export const makeWsRelay = (options: WebSocket.ServerOptions) => {
    const wss = new WebSocket.Server(options);

    wss.on("connection", (ws: AppWebsocket, req) => {
        console.log("relay connection", req.url);
        const isValid = isAuthValid(ws, req);
        if (!isValid) return;

        ws.isAlive = true;
        ws.on("pong", () => (ws.isAlive = true));

        // YJS gère les lobby/games
        // pass à la volée des events Xstate via WSRelay
        // on page refresh (f5) -> get current room machine state ?
        ws.on("message", (data: any, isBinary: boolean) => {
            wss.clients.forEach((client) => {
                if (client === ws || client.readyState !== WebSocket.OPEN) return;

                client.send(data, { binary: isBinary });
                // client.send(encode(data), { binary: true });
            });
            // TODO scoped msg = in some rooms only
            // identified by name + by using getYDOc from y-websocket.ts
            // getArray(name).clients.map((client) => client.socketId)
            // puis wss.clients.foreach((if client.socketId in roomSocketIds) client.send(msg))
        });
    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws: AppWebsocket) => {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping(noop);
        });
    }, 30000);

    wss.on("close", () => clearInterval(interval));

    return wss;
};

function noop() {}
type AppWebsocket = WebSocket & { isAlive?: boolean };

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

// Server
// const encoder = new TextEncoder();
// const decoder = new TextDecoder();

// const encode = <Payload>(payload: Payload) => encoder.encode(JSON.stringify(payload));
// const decode = async <Payload = any>(payload: ArrayBuffer | string): Promise<Payload> => {
//     try {
//         const data = payload instanceof ArrayBuffer ? decoder.decode(payload) : payload;
//         return JSON.parse(data);
//     } catch (err) {
//         return null;
//     }
// };

// Client
// const decoder = new StringDecoder("utf8");
// const decode = (message: ArrayBuffer) => decoder.write(Buffer.from(message));
// const parse = (message: ArrayBuffer): [string, any] | null => {
//     try {
//         const str = decode(message);

//         // Message isn't valid (should like be [event, payload])
//         if (!str.startsWith("[")) {
//             return null;
//         }

//         const json = JSON.parse(str);
//         return json;
//     } catch (err) {
//         return null;
//     }
// }
