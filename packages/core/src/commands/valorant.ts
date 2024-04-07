import { ValorantService, addValorantPlayer, removeValorantPlayer } from "@/features/stalker/valorant/ValorantService";
import type { GameConfig } from "./players";
import { InsertValorantRank, ValorantPlayer, valorantPlayer, valorantRank } from "@/db/valorantSchema";
import { desc, eq, and } from "drizzle-orm";
import { db } from "@/db/db";
import { EmbedBuilder } from "discord.js";
import { formatValorantMmr } from "@/features/stalker/valorant/valorant";

export const valorantConfig: GameConfig = {
    addPlayer: async ({ name, tag, channelId }) => {
        const valorantPlayer = await ValorantService.getPlayerByName(name + "#" + tag);
        await addValorantPlayer(valorantPlayer, channelId);
    },

    removePlayer: async ({ name, tag, channelId }) => {
        await removeValorantPlayer(name + "#" + tag, channelId);
    },

    listPlayers: async ({ channelId }) => {
        const players = await db
            .select()
            .from(valorantPlayer)
            .where(and(eq(valorantPlayer.channelId, channelId), eq(valorantPlayer.isActive, true)));
        if (!players.length) return { content: "No player stalked" };

        const getDescription = () => {
            return players.map((s) => s.currentName).join("\n");
        };

        const embed = new EmbedBuilder().setTitle("Valorant stalked players").setDescription(getDescription());

        return { embeds: [embed] };
    },

    leaderboard: async ({ channelId }) => {
        const players = await db
            .select()
            .from(valorantPlayer)
            .where(and(eq(valorantPlayer.channelId, channelId), eq(valorantPlayer.isActive, true)));
        if (!players.length) return { content: "No player stalked" };

        const playersWithRanks: { player: ValorantPlayer; rank: InsertValorantRank }[] = [];

        for (const player of players) {
            const rank = await db
                .select()
                .from(valorantRank)
                .where(eq(valorantRank.playerId, player.puuid))
                .orderBy(desc(valorantRank.createdAt))
                .limit(1);

            if (rank.length) {
                playersWithRanks.push({
                    player,
                    rank: rank[0],
                });
            }
        }

        const getDescription = () => {
            if (!playersWithRanks.length) return "No player watched";
            return playersWithRanks
                .sort((a, b) => b.rank.elo - a.rank.elo)
                .map((s, index) => `${index + 1}) **${s.player.currentName}** ${formatValorantMmr(s.rank)}`)
                .join("\n");
        };

        const embed = new EmbedBuilder().setTitle("Valorant stalked leaderboard").setDescription(getDescription());

        return { embeds: [embed] };
    },
};
