import "./envVars";

import { makeApp } from "./app";

const port = Number(process.env.HTTP_PORT) || 1337;

const start = async () => {
    const app = await makeApp();
    try {
        const address = await app.listen(port);
        app.log.info(`server listening on ${address}`);
        console.log({ port });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
