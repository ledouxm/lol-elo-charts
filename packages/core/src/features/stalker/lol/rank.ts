import { db } from "@/db/db";
import { InsertRank, rank } from "@/db/schema";
import { ENV } from "@/envVars";
import { galeforce } from "@/features/summoner";
import { eq, desc } from "drizzle-orm";
import { omit } from "pastable";
import { Constants, LolApi } from "twisted";

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

// temporary fix since galeforce is not up to date
const api = new LolApi({
    key: ENV.RG_API_KEY,
});

const getLoLElos = async (id: string) => {
    const result = await api.League.byPUUID(id, Constants.Regions.EU_WEST);

    return result.response;
};

export type LoLRankWithWinsLosses = Awaited<ReturnType<typeof getLoLNewRank>>;
export type LoLRank = Omit<LoLRankWithWinsLosses, "wins" | "losses">;
