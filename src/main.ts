import "./envVars";
import "./discord";
import { initDb } from "./db/db";
import { startDiscordBot } from "./discord";
import { checkElo, getAndSaveApex } from "./routes";
import cron from "node-cron";
import cronstrue from "cronstrue";

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

const startCronJobs = () => {
    const eloDelay = `*/${process.env.CRON_DELAY_SEC || 5} * * * *`;
    console.log("checking elo", cronstrue.toString(eloDelay));
    cron.schedule(eloDelay, () => checkElo());

    console.log("getting apex and generating recaps", cronstrue.toString("0 0 * * *"));
    cron.schedule("0 0 * * *", () => getAndSaveApex());
};

start();
