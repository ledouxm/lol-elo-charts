import "./envVars";
import { initDb } from "./db/db";
import { startDiscordBot } from "./features/discord/discord";
import { getAndSaveApex } from "./features/lol/apex";
import { makeRouter } from "./features/router";
import { lolStalker } from "./features/stalker/lol/lol";
import { startCronJobs } from "./startCronJobs";

const start = async () => {
    await initDb();
    await startDiscordBot();
    startCronJobs();
    makeRouter();
    await lolStalker.start();

    if (process.env.FORCE_RECAPS) {
        await getAndSaveApex();
    }
};

try {
    start();
} catch (err) {
    console.log(err);
    process.exit(1);
}
