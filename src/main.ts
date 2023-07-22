import "./envVars";
import { initDb } from "./db/db";
import "./discord";
import { startDiscordBot } from "./discord";
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
