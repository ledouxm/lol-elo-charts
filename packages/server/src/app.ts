import { RequestContext } from "@mikro-orm/core";
import { isDev, ObjectLiteral } from "@pastable/core";
import fastify from "fastify";
import WebSocket from "ws";
import { getOrm, makeOrm } from "./db";
import { User } from "./entities/User";
import { getClientMeta, getClients, getClientState, makeWsClient } from "./helpers";
import { onConnection } from "./onConnection";
import { routes } from "./routes";
import { AppWebsocket, GameRoom, GlobalSubscription, Room, SimpleRoom, WsClient } from "./types";

export const makeApp = async () => {
    const app = fastify({ logger: false });
    const orm = await makeOrm();

    app.register(require("fastify-cors"));
    app.addHook("preHandler", (_req, _reply, done) => RequestContext.create(orm.em, done));
    app.register(routes);

    return app;
};

const cleanupEvery = 30 * 1000;
export const makeWsApp = (options: WebSocket.ServerOptions) => {
    const wss = new WebSocket.Server(options);
    const opts = { binary: false };

    // States
    const rooms = new Map<Room["name"], SimpleRoom>();
    const games = new Map<Room["name"], GameRoom>();
    const clients = new Map<AppWebsocket["id"], WsClient>();

    let clientCounts = 0; // auto-increment on connection

    const globalSubscriptions = new Map<GlobalSubscription, Set<AppWebsocket>>([
        ["presence", new Set()],
        ["rooms", new Set()],
        ["games", new Set()],
    ]);

    // State helpers
    const getAllClients = () => getClients(wss.clients as Set<AppWebsocket>);
    const getPresenceList = () => getAllClients().map(getClientState);
    const getPresenceMetaList = () => getAllClients().map(getClientMeta);

    const states = { wss, opts, rooms, games, clients, clientCounts, globalSubscriptions };
    const methods = { getAllClients, getPresenceList, getPresenceMetaList };
    const ctx = { ...states, ...methods };

    const orm = getOrm();
    wss.on("connection", (ws, req) => {
        try {
            RequestContext.create(orm.em, () => onConnection(ws as AppWebsocket, req, ctx));
        } catch (error) {
            if (isDev()) throw error;
            console.error(error);
        }
    });

    // Clean broken connections every X seconds
    const interval = setInterval(() => {
        (wss.clients as Set<AppWebsocket>).forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping(noop);
        });
    }, cleanupEvery);

    // On server close
    wss.on("close", () => {
        clearInterval(interval);
    });

    return wss;
};

function noop() {}
