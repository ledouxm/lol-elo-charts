import { ENV } from "./envVars";
import { initDb } from "./db/db";
import { startDiscordBot } from "./features/discord/discord";
import { getAndSaveApex } from "./features/lol/apex";
import { makeRouter } from "./features/router";
import { lolStalker } from "./features/stalker/lol/lol";
import { valorantStalker } from "./features/stalker/valorant/valorant";
import { startCronJobs } from "./startCronJobs";
import { getWowRecentRun } from "./features/wow/wowStalker";

const start = async () => {
    await initDb();
    // await startDiscordBot();
    console.log(await getWowRecentRun({ region: "eu", realm: "ysondre", name: "pinmardoule" }));

    // startCronJobs();
    // makeRouter();

    // await lolStalker.start();
    // await valorantStalker.start();

    // if (ENV.FORCE_RECAPS) {
    //     await getAndSaveApex();
    // }
};

try {
    start();
} catch (err) {
    console.log(err);
    process.exit(1);
}
