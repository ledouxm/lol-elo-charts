import { RequestContext } from "@mikro-orm/core";
import fastify from "fastify";

import { makeOrm } from "./db";
import { routes } from "./routes";

export const makeApp = async () => {
    const app = fastify({ logger: false });
    const orm = await makeOrm();

    app.register(require("@fastify/cors"));
    app.addHook("preHandler", (_req, _reply, done) => RequestContext.create(orm.em, done));
    app.register(routes);

    return app;
};

function noop() {}
