import { db } from "@/db/db";
import { valorantPlayer } from "@/db/valorantSchema";
import { and, eq } from "drizzle-orm";
import { ValorantPlayerWithChannels } from "./ValorantService";

export const getValorantPlayersWithChannels = async (channelId?: string) => {
    const baseWhere = eq(valorantPlayer.isActive, true);
    const where = channelId ? and(baseWhere, eq(valorantPlayer.channelId, channelId)) : baseWhere;

    const allValorantPlayers = await db.select().from(valorantPlayer).where(where);
    const valorantPlayers = allValorantPlayers.reduce((acc, s) => {
        const index = acc.findIndex((a) => a.puuid === s.puuid);
        if (index !== -1) {
            acc[index].channels.push(s.channelId);
        } else acc.push({ ...s, channels: [s.channelId] });

        return acc;
    }, [] as ValorantPlayerWithChannels[]);

    return valorantPlayers;
};

export const persistLastValorantGameId = async (puuid: string, gameId: string) => {
    await db.update(valorantPlayer).set({ lastGameId: gameId }).where(eq(valorantPlayer.puuid, puuid));
};
