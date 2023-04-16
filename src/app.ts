import { RequestContext } from "@mikro-orm/core";
import express from "express";

import cors from "cors";
import cron from "node-cron";

import { makeOrm } from "./db";
import { checkElo, getAndSaveApex, router } from "./routes";

export const makeApp: any = async () => {
    const app = express();
    app.use(express.json());
    console.log("CORS");
    app.use(cors());

    const orm = await makeOrm();

    startCronJobs();

    app.use((_req, _res, done) => RequestContext.create(orm.em, done));
    app.use("/", router);

    return app;
};

const startCronJobs = () => {
    cron.schedule("*/15 * * * *", () => checkElo());
    cron.schedule("0 0 * * *", () => getAndSaveApex());
};

function noop() {}
