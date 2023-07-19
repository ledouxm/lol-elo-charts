import "./envVars";
import "./discord";
import { initDb } from "./db/db";
import { startDiscordBot } from "./discord";
import { checkBetsAndGetLastGame } from "./routes";
import { generate24hBetsRecap, generate24hRecaps } from "./generate24hRecap";
import { startCronJobs } from "./startCronJobs";

const start = async () => {
    try {
        await initDb();
        await startDiscordBot();
        startCronJobs();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

start();
