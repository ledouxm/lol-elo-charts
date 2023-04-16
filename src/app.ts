import { RequestContext } from "@mikro-orm/core";
import express from "express";

import cors from "cors";

import { makeOrm } from "./db";
import { router, startCheckLoop } from "./routes";

export const makeApp: any = async () => {
    const app = express();
    app.use(express.json());
    app.use(cors());
    const orm = await makeOrm();

    startCheckLoop();

    app.use((_req, _res, done) => RequestContext.create(orm.em, done));
    app.use("/", router);

    return app;
};

function noop() {}
