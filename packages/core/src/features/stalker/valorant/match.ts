import { ValorantPlayer, valorantMatch, valorantPlayer } from "@/db/valorantSchema";
import { ValorantService } from "./ValorantService";
import { db } from "@/db/db";
import { eq, and } from "drizzle-orm";

export const getLastValorantGameAndStoreIfNecessary = async (player: ValorantPlayer) => {
    const lastMatch = await ValorantService.getLastGame(player.puuid);

    if (!lastMatch) return null;

    const existings = await db
        .select()
        .from(valorantMatch)
        .where(eq(valorantMatch.id, lastMatch.metadata.matchid))
        .limit(1);

    if (existings.length) return existings[0].details;

    await db.insert(valorantMatch).values({
        id: lastMatch.metadata.matchid,
        details: lastMatch,
    });

    return lastMatch;
};
