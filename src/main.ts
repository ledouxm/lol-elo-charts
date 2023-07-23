import "./envVars";
import { db, initDb } from "./db/db";
import "./discord";
import { startDiscordBot } from "./discord";
import { startCronJobs } from "./startCronJobs";
import { rank, summoner } from "./db/schema";
import { galeforce } from "./features/summoner";
import { getSummonerData } from "./features/lol/summoner";
import { eq } from "drizzle-orm";
import { getAndSaveApex } from "./features/apex";

const start = async () => {
    try {
        await initDb();
        await startDiscordBot();

        startCronJobs();

        if (process.env.FORCE_RECAPS) {
            await getAndSaveApex();
        }
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

const transformSummonerAndRanks = async () => {
    const summoners = await db.selectDistinctOn([summoner.currentName]).from(summoner);

    for (const summ of summoners) {
        const riotSummoner = await galeforce.lol
            .summoner()
            .region(galeforce.region.lol.EUROPE_WEST)
            .name(summ.currentName)
            .exec();
        if (!riotSummoner) continue;

        const summonerData = await getSummonerData(riotSummoner.puuid);

        const ranks = await db.select().from(rank).where(eq(rank.summonerId, summ.puuid));

        for (const r of ranks) {
            await db.update(rank).set({ summonerId: summonerData.puuid }).where(eq(rank.id, r.id));
        }

        await db
            .update(summoner)
            .set({ puuid: summonerData.puuid, id: summonerData.id })
            .where(eq(summoner.id, summ.id));

        // const ranks = await db.select().from(rank);
        // const summonersWithRanks = summoners.map((s) => {
        //     const rank = ranks.find((r) => r.summonerId === s.puuid);
        //     return { ...s, rank };
        // });
        // await db.insert(summoner).values(summonersWithRanks);
    }
};

start();
