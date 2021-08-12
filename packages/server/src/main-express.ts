import express from "express";
import cors from "cors";
import WebSocket, { Server as WsServer, OPEN } from "ws";
import { StringDecoder } from "node:string_decoder";

const app = express();

app.use(cors());
app.use(express.json());

const wsPort = parseInt(process.env.WS_PORT, 10) || 1338;
const wss = new WsServer({ port: wsPort });

function noop() {}

type AppWebsocket = WebSocket & { isAlive?: boolean };

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

wss.on("connection", (ws: AppWebsocket) => {
    ws.isAlive = true;
    ws.on("pong", () => (ws.isAlive = true));

    ws.on("message", (data: any, isBinary: boolean) => {
        wss.clients.forEach((client) => {
            if (client.readyState !== OPEN) return;

            client.send(data, { binary: isBinary });
        });
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

const port = parseInt(process.env.PORT, 10) || 1337;
const server = app.listen(port);
console.log(`Listening on express:${port}/ws:${wsPort}`);
