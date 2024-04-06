import { db } from "@/db/db";
import { InsertRank, rank } from "@/db/schema";
import { galeforce } from "@/features/summoner";
import { eq, desc } from "drizzle-orm";
import { omit } from "pastable";

export const getLoLLastRank = async (puuid: string) => {
    const lastRanks = await db
        .select()
        .from(rank)
        .where(eq(rank.summonerId, puuid))
        .orderBy(desc(rank.createdAt))
        .limit(1);

    const lastRank = lastRanks?.[0] as InsertRank;
    return lastRank;
};

export const getLoLNewRank = async (puuid: string) => {
    const elo = await getLoLSoloQElo(puuid);
    if (!elo) return null;

    const newRank = {
        tier: elo.tier as InsertRank["tier"],
        division: elo.rank as InsertRank["division"],
        leaguePoints: elo.leaguePoints,
        wins: elo.wins,
        losses: elo.losses,
    };

    return newRank;
};

export const storeNewLoLRank = async (puuid: string, newRank: LoLRankWithWinsLosses) => {
    await db.insert(rank).values({ ...omit(newRank, ["wins", "losses"]), summonerId: puuid });
};

const getLoLSoloQElo = async (id: string) => {
    const elos = await getLoLElos(id);
    const elo = elos.find((e) => e.queueType === "RANKED_SOLO_5x5");
    if (!elo) return null;

    return elo;
};

const getLoLElos = async (id: string) => {
    const result = await galeforce.lol.league
        .entries()
        .summonerId(id)
        .region(galeforce.region.lol.EUROPE_WEST)
        .queue(galeforce.queue.lol.RANKED_SOLO)
        .exec();

    return result;
};

export type LoLRankWithWinsLosses = Awaited<ReturnType<typeof getLoLNewRank>>;
export type LoLRank = Omit<LoLRankWithWinsLosses, "wins" | "losses">;
