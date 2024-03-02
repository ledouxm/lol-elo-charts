import "./envVars";
import { initDb } from "./db/db";
import "./features/discord/discord";
import { startDiscordBot } from "./features/discord/discord";
import { getAndSaveApex } from "./features/lol/apex";
import { makeRouter } from "./features/router";
import { startCronJobs } from "./startCronJobs";

const start = async () => {
    try {
        await initDb();
        await startDiscordBot();
        startCronJobs();
        makeRouter();
        if (process.env.FORCE_RECAPS) {
            await getAndSaveApex();
        }
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

start();
