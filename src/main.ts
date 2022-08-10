import dotenv from "dotenv";
dotenv.config();
// import { makeApp } from "./app";
import express from "express";
const port = Number(process.env.HTTP_PORT) || 1337;

const start = async () => {
    try {
        const app = express();
        app.use("*", (_, res) => res.send("ok2"));
        app.listen(port, () => {
            console.log(`server listening on ${port}`);
        });
        // const app = await makeApp();
        // const address = await app.listen({ port });
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

start();
