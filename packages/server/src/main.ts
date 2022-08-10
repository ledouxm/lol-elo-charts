import dotenv from "dotenv";
dotenv.config();
import { makeApp } from "./app";

const port = Number(process.env.HTTP_PORT) || 1337;

const start = async () => {
    const app = await makeApp();
    try {
        const address = await app.listen({ port });
        console.log(`server listening on ${address}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
