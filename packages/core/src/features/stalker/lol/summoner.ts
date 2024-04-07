import { db } from "@/db/db";
import { Summoner, rank, summoner } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { galeforce } from "../../summoner";

export const getSummonersWithChannels = async (channelId?: string) => {
    const baseWhere = eq(summoner.isActive, true);
    const where = channelId ? and(baseWhere, eq(summoner.channelId, channelId)) : baseWhere;

    const allSummoners = await db.select().from(summoner).where(where);
    const summoners = allSummoners.reduce((acc, s) => {
        const index = acc.findIndex((a) => a.puuid === s.puuid);
        if (index !== -1) {
            acc[index].channels.push(s.channelId);
        } else acc.push({ ...s, channels: [s.channelId] });

        return acc;
    }, [] as SummonerWithChannels[]);

    return summoners;
};

export const updateSummonerName = async (puuid: string, name: string) => {
    await db.update(summoner).set({ currentName: name }).where(eq(summoner.puuid, puuid));
};

export type SummonerWithChannels = Summoner & { channels: string[] };
