import "./envVars";
import { db, initDb } from "./db/db";
import "./discord";
import { startDiscordBot } from "./discord";
import { startCronJobs } from "./startCronJobs";
import { bet } from "./db/schema";
import { galeforce } from "./features/summoner";
import { checkBetsAndGetLastGame } from "./features/bets";
import { getBetsByChannelIdGroupedBySummoner } from "./commands/bets";

const start = async () => {
    try {
        await initDb();
        // console.log(await db.select().from(bet));

        // get EUW1_6507715921 game
        // const game = await galeforce.lol.match
        //     .match()
        //     .region(galeforce.region.riot.EUROPE)
        //     .matchId("EUW1_6507715921")
        //     .exec();

        // console.log(game);

        // console.log(await getBetsByChannelIdGroupedBySummoner("771873443037315076"));
        // await checkBetsAndGetLastGame("8FUfCIV3EkC8Z-J_hItTs8VI2LV1kW-9UlZ4iEkOa_0kqkkAZt1V8foBuqt0A_-D0XVnbycHInoz0Q");

        await startDiscordBot();
        startCronJobs();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

start();
