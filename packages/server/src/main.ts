import "./envVars";
import { makeApp, makeWsApp } from "./app";

const port = Number(process.env.HTTP_PORT) || 1337;
const wsPort = parseInt(process.env.WS_PORT, 10) || 1338;

const start = async () => {
    const app = await makeApp();
    try {
        const address = await app.listen(port);
        app.log.info(`server listening on ${address}`);
        console.log({ port, wsPort });
        makeWsApp({ port: wsPort });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
