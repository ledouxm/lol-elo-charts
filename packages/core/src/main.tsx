import "./envVars";
import { db, initDb } from "./db/db";
import "./features/discord/discord";
import { startDiscordBot } from "./features/discord/discord";
import { getAndSaveApex } from "./features/lol/apex";
import { makeRouter } from "./features/router";
import { startCronJobs } from "./startCronJobs";
import { getNbPlayerOfTheDay, getStreak } from "./features/generate24hRecap";
import { summoner } from "./db/schema";
import { eq } from "drizzle-orm";

const start = async () => {
    try {
        await initDb();
        // const puuid = "f-i90kCsre0NdO54fDHpeuKctcmczfUcHLopoiQskRxcsTiJ3PM7VSfGEE4MZ_rqJTwH9fFTLWIUsA";
        // const summ = await db.select().from(summoner).where(eq(summoner.puuid, puuid));

        // console.log(
        //     await getStreak({
        //         channelId: "1132013776653266986",
        //         summoner: summ[0],
        //         type: "winner",
        //     })
        // );

        // console.log(await getNbPlayerOfTheDay({ channelId: "1132013776653266986", summoner: summ[0], type: "winner" }));
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
