import { makeWs, startTicking } from "./app";
import express from "express";
import cors from "cors";
import { makeDebug } from "./utils";

const debug = makeDebug("main");

const wsPort = parseInt(process.env.WS_PORT, 10) || 1338;

const start = async () => {
    try {
        makeWs({ port: wsPort });
        startTicking();
    } catch (err) {
        process.exit(1);
    }
};

const startApi = () => {
    const app = express();
    app.use(cors());
    app.get("/status", (_, res) => res.status(200).send("ok"));
    app.listen(8080, () => {
        debug("listening on port 8080");
    });
};

start();
startApi();
