import { addSummoner, getSummonerByName, removeSummoner } from "@/features/summoner";
import type { GameConfig } from "./players";
import { db } from "@/db/db";
import { apex, rank, summoner } from "@/db/schema";
import { makeTierData, getTotalLpFromRank } from "@/features/lol/lps";
import { EmbedBuilder, MessageCreateOptions } from "discord.js";
import { desc, eq, and } from "drizzle-orm";

export const lolConfig: GameConfig = {
    addPlayer: async ({ name, tag, channelId }) => {
        const riotSummoner = await getSummonerByName(name, tag);
        await addSummoner(riotSummoner, channelId);
    },

    removePlayer: async ({ name, channelId }) => {
        await removeSummoner(name, channelId);
    },
    listPlayers: async ({ channelId }) => {
        const summoners = await db
            .select()
            .from(summoner)
            .where(and(eq(summoner.channelId, channelId), eq(summoner.isActive, true)));
        if (!summoners.length) return { content: "No summoner stalked" };

        const getDescription = () => {
            return summoners.map((s) => s.currentName).join("\n");
        };

        const embed = new EmbedBuilder().setTitle("LoL stalked summoners").setDescription(getDescription());

        return { embeds: [embed] };
    },

    leaderboard: async ({ channelId }) => {
        const lastApex = await db.select().from(apex).orderBy(desc(apex.createdAt)).limit(1);
        const tierData = makeTierData(lastApex[0]);
        const summoners = await db
            .select()
            .from(summoner)
            .where(and(eq(summoner.channelId, channelId), eq(summoner.isActive, true)));

        const summonersWithRank = [];

        for (const summoner of summoners) {
            const summonerRank = await db
                .select()
                .from(rank)
                .where(eq(rank.summonerId, summoner.puuid))
                .orderBy(desc(rank.createdAt))
                .limit(1);

            if (summonerRank.length) {
                summonersWithRank.push({
                    summoner,
                    rank: summonerRank[0],
                    totalLp: getTotalLpFromRank(summonerRank[0], tierData),
                });
            }
        }

        const getDescription = () => {
            if (!summonersWithRank.length) return "No summoner stalked";
            return summonersWithRank
                .sort((a, b) => b.totalLp - a.totalLp)
                .map(
                    (s, index) =>
                        `${index + 1}) **${s.summoner.currentName}** ${s.rank.tier} ${s.rank.division} ${
                            s.rank.leaguePoints
                        } LP`
                )
                .join("\n");
        };

        const embed = new EmbedBuilder().setTitle("LoL stalked leaderboard").setDescription(getDescription());

        return { embeds: [embed] };
    },
};
