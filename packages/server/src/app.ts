import { RequestContext } from "@mikro-orm/core";
import fastify from "fastify";
import WebSocket from "ws";
import { getOrm, makeOrm } from "./db";
import { User } from "./entities/User";
import { getClientMeta, getClients, getClientState, makeUser as makeWsUser } from "./helpers";
import { onConnection } from "./onConnection";
import { routes } from "./routes";
import { AppWebsocket, GameRoom, GlobalSubscription, Room, SimpleRoom, WsUser } from "./types";

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
    const users = new Map<AppWebsocket["id"], WsUser>();

    const userIds = new Set<WsUser["id"]>();
    let userCounts = 0; // auto-increment on connection

    const globalSubscriptions = new Map<GlobalSubscription, Set<AppWebsocket>>([
        ["presence", new Set()],
        ["rooms", new Set()],
        ["games", new Set()],
    ]);

    // State helpers
    const getWsUser = (id: AppWebsocket["id"], user?: User) => {
        if (!users.has(id)) {
            users.set(id, makeWsUser(id, user));
        }

        return users.get(id);
    };

    const getAllClients = () => getClients(wss.clients as Set<AppWebsocket>);
    const getPresenceList = () => getAllClients().map(getClientState);
    const getPresenceMetaList = () => getAllClients().map(getClientMeta);

    const states = { wss, opts, rooms, games, users, userIds, userCounts, globalSubscriptions };
    const methods = { getWsUser, getAllClients, getPresenceList, getPresenceMetaList };
    const ctx = { ...states, ...methods };

    const orm = getOrm();
    wss.on("connection", (ws, req) => RequestContext.create(orm.em, () => onConnection(ws as AppWebsocket, req, ctx)));

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
