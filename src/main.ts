import "./envVars";
import { db, initDb } from "./db/db";
import "./features/discord/discord";
import { startDiscordBot } from "./features/discord/discord";
import { startCronJobs } from "./startCronJobs";
import { match, rank, summoner } from "./db/schema";
import { addRequest, galeforce, getSummonersWithChannels } from "./features/summoner";
import { getSummonerData } from "./features/lol/summoner";
import { eq, and } from "drizzle-orm";
import { getAndSaveApex } from "./features/lol/apex";
import axios from "axios";
import { makeRouter } from "./features/router";
import { insertMatchFromMatchDto } from "./features/bets";

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

const fetchMatches = async (matchIds: string[]) => {
    const summoners = await db.selectDistinctOn([summoner.puuid]).from(summoner);
    for (const matchId of matchIds) {
        const game = await galeforce.lol.match.match().region(galeforce.region.riot.EUROPE).matchId(matchId).exec();

        for (const participant of game.info.participants) {
            const summ = summoners.find((s) => s.puuid === participant.puuid);
            if (!summ) continue;

            const existingMatch = await db
                .select()
                .from(match)
                .where(and(eq(match.matchId, matchId), eq(match.summonerId, summ.puuid)))
                .limit(1);
            if (existingMatch?.[0]) continue;

            await insertMatchFromMatchDto(game, summ.puuid);
        }
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
        await addRequest();
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
