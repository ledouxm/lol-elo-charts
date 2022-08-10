import { RequestContext } from "@mikro-orm/core";
import express from "express";

import { makeOrm } from "./db";
import { router } from "./routes";

export const makeApp: any = async () => {
    const app = express();
    const orm = await makeOrm();

    app.use((_req, _res, done) => RequestContext.create(orm.em, done));
    app.use("/", router);

    return app;
};

function noop() {}
