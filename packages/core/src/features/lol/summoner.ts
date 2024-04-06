import { db } from "@/db/db";
import { addRequest, galeforce } from "../summoner";
import { InsertRank, rank, summoner } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const getSummonerData = async (puuid: string) => {
    const summonerData = await galeforce.lol.summoner().region(galeforce.region.lol.EUROPE_WEST).puuid(puuid).exec();
    const account = await galeforce.riot.account.account().region(galeforce.region.riot.EUROPE).puuid(puuid).exec();
    await addRequest();
    return { ...summonerData, fullname: `${account.gameName}#${account.tagLine}` };
};

export const getLastRank = async (puuid: string) => {
    const lastRanks = await db
        .select()
        .from(rank)
        .where(eq(rank.summonerId, puuid))
        .orderBy(desc(rank.createdAt))
        .limit(1);

    const lastRank = lastRanks?.[0] as InsertRank;
    return lastRank;
};
