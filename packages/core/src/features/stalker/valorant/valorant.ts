import { InsertValorantRank } from "@/db/valorantSchema";
import { Stalker, StalkerMessage } from "../stalker";
import { ValorantMatch, ValorantMmr, ValorantPlayerWithChannels, ValorantService } from "./ValorantService";
import { getValorantPlayersWithChannels, persistLastValorantGameId } from "./player";
import { getValorantLastRank, storeNewValorantRank, valorantTiers } from "./mmr";
import { getValorantRankDifferenceEmbed } from "./embeds";
import { getLastValorantGameAndStoreIfNecessary } from "./match";
import { ENV } from "@/envVars";

export const valorantStalker = new Stalker<ValorantPlayerWithChannels, ValorantMatch, ValorantMmr, InsertValorantRank>({
    debugNamespace: "valorant",
    formatRank: (rank) => formatValorantMmr(rank),
    getPlayers: async () => {
        const summoners = await getValorantPlayersWithChannels();
        return summoners;
    },
    getRank: async ({ player }) => {
        const rank = await ValorantService.getPlayerCurrentMmr(player.puuid);
        return rank;
    },
    persistChanges: async ({ changes, debug }) => {
        for (const { player, lastMatch, newRank } of changes) {
            debug("Storing new rank");
            await storeNewValorantRank(player.puuid, newRank);

            if (lastMatch) {
                await persistLastValorantGameId(player.puuid, lastMatch.metadata.matchid);
            }
        }
    },
    getLastMatch: async ({ player }) => {
        const lastGame = await getLastValorantGameAndStoreIfNecessary(player);
        return lastGame;
    },
    getLastRank: async ({ player }) => {
        return getValorantLastRank(player.puuid);
    },
    areRanksEqual: ({ lastRank, newRank }) => {
        return lastRank?.elo === newRank.elo;
    },
    getDiscordMessages: async ({ changes }) => {
        const messages: StalkerMessage[] = [];
        for (const change of changes) {
            for (const channel of change.player.channels) {
                const embed = getValorantRankDifferenceEmbed(change);

                messages.push({
                    channelId: channel,
                    embeds: [embed],
                });
            }
        }

        return messages;
    },
    getPlayerName: ({ player }) => player.currentName,
    discordNotificationInterval: 1000 * ENV.VALORANT_DISCORD_NOTIFICATION_INTERVAL_SEC,
    playerRequestInterval: 1000 * ENV.VALORANT_PLAYER_REQUEST_INTERVAL_SEC,
});

export const formatValorantMmr = (rank: ValorantMmr) => {
    if (!rank) return "";
    const index = Math.floor(rank.elo / 100);
    const rr = rank.elo % 100;

    return `${valorantTiers[index]} - ${rr} RR`;
};
