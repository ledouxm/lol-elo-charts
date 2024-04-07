import { initDb } from "./db/db";
import "./envVars";
import { ENV } from "./envVars";
import { startDiscordBot } from "./features/discord/discord";
import { getAndSaveApex } from "./features/lol/apex";
import { makeRouter } from "./features/router";
import { lolStalker } from "./features/stalker/lol/lol";
import { valorantStalker } from "./features/stalker/valorant/valorant";
import { startCronJobs } from "./startCronJobs";

const start = async () => {
    await initDb();
    await startDiscordBot();

    startCronJobs();
    makeRouter();

    await lolStalker.start();
    await valorantStalker.start();

    if (ENV.FORCE_RECAPS) {
        await getAndSaveApex();
    }
};

try {
    start();
} catch (err) {
    console.log(err);
    process.exit(1);
}
