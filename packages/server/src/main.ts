import dotenv from "dotenv";
dotenv.config();
import { makeApp } from "./app";

const port = Number(process.env.HTTP_PORT) || 1337;

const start = async () => {
    try {
        const app = await makeApp();
        const address = await app.listen({ port, host: "0.0.0.0" });
        console.log(`server listening on ${address}`);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

start();
