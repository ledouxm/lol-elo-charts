import { InsertValorantRank } from "@/db/valorantSchema";
import { Stalker, StalkerChange, StalkerMessage } from "../stalker";
import { ValorantMatch, ValorantMmr, ValorantPlayerWithChannels, ValorantService } from "./ValorantService";
import { getValorantPlayersWithChannels, persistLastValorantGameId, updateValorantPlayerName } from "./player";
import { getValorantLastRank, storeNewValorantRank, valorantTiers } from "./mmr";
import { getComponentsRow, getValorantRankDifferenceEmbed } from "./embeds";
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

            if (!lastMatch) return;

            await persistLastValorantGameId(player.puuid, lastMatch.metadata.matchid);

            const playerInGame = lastMatch.players.all_players.find((p) => p.puuid === player.puuid);

            const newName = `${playerInGame.name}#${playerInGame.tag}`;
            if (playerInGame && player.currentName !== newName) {
                await updateValorantPlayerName(player.puuid, newName);
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
                const components = getRankChangeComponents(change);

                // @ts-ignore - discordjs typings are wrong
                messages.push({ channelId: channel, embeds: [embed], components: components });
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

const getRankChangeComponents = ({ lastMatch, player }: ValorantStalkerChange) => {
    if (!lastMatch) return [];

    const participantIndex = lastMatch.players.all_players.findIndex((p) => p.puuid === player.puuid);
    const row = getComponentsRow({ matchId: lastMatch.metadata.matchid, participantIndex });

    return [row];
};



type ValorantStalkerChange = StalkerChange<ValorantPlayerWithChannels, ValorantMatch, ValorantMmr, InsertValorantRank>;