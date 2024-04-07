import { db } from "@/db/db";
import { valorantRank } from "@/db/valorantSchema";
import { desc, eq } from "drizzle-orm";
import { ValorantMmr } from "./ValorantService";

export const getValorantLastRank = async (puuid: string) => {
    const ranks = await db
        .select()
        .from(valorantRank)
        .where(eq(valorantRank.playerId, puuid))
        .orderBy(desc(valorantRank.createdAt))
        .limit(1);
    return ranks?.[0];
};

export const storeNewValorantRank = async (puuid: string, newRank: ValorantMmr) => {
    await db.insert(valorantRank).values({
        playerId: puuid,
        elo: newRank.elo,
    });
};

export const valorantTiers = [
    "Iron 1",
    "Iron 2",
    "Iron 3",
    "Bronze 1",
    "Bronze 2",
    "Bronze 3",
    "Silver 1",
    "Silver 2",
    "Silver 3",
    "Gold 1",
    "Gold 2",
    "Gold 3",
    "Platinum 1",
    "Platinum 2",
    "Platinum 3",
    "Diamond 1",
    "Diamond 2",
    "Diamond 3",
    "Ascendant 1",
    "Ascendant 2",
    "Ascendant 3",
    "Immortal 1",
    "Immortal 2",
    "Immortal 3",
    "Radiant",
].map((str) => str.toUpperCase());
