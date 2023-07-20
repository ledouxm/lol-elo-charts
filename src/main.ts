import "./envVars";
import { db, initDb } from "./db/db";
import "./discord";
import { startDiscordBot } from "./discord";
import { startCronJobs } from "./startCronJobs";
const start = async () => {
    try {
        await initDb();
        await startDiscordBot();
        startCronJobs();
        // await checkElo();
        // await checkBetsAndGetLastGame("8FUfCIV3EkC8Z-J_hItTs8VI2LV1kW-9UlZ4iEkOa_0kqkkAZt1V8foBuqt0A_-D0XVnbycHInoz0Q");
        // startCronJobs();

        // console.log(await getBetsByChannelIdGroupedBySummoner("771873443037315076"));
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

start();
