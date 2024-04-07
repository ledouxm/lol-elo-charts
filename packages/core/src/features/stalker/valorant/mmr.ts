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
