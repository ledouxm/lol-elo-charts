import { InsertRank } from "@/db/schema";
import { MatchDTO } from "galeforce/dist/galeforce/interfaces/dto";
import { Stalker, StalkerChange, StalkerMessage } from "../stalker";
import { getComponentsRow, getFirstRankEmbed, getRankDifferenceEmbed } from "./embeds";
import { getLastGameAndStoreIfNecessary, persistLastGameId } from "./match";
import { LoLRankWithWinsLosses, getLoLLastRank, getLoLNewRank, storeNewLoLRank } from "./rank";
import { areRanksEqual, formatRank, getRankDifference } from "./rankUtils";
import { SummonerWithChannels, getSummonersWithChannels, updateSummonerName } from "./summoner";
import { ENV } from "@/envVars";

export const lolStalker = new Stalker<SummonerWithChannels, MatchDTO, LoLRankWithWinsLosses, InsertRank>({
    debugNamespace: "lol",
    formatRank: (rank) => formatRank(rank),
    getPlayers: async () => {
        const summoners = await getSummonersWithChannels();
        return summoners;
    },
    getRank: async ({ player }) => {
        const rank = await getLoLNewRank(player.puuid);
        return rank;
    },
    persistChanges: async ({ changes, debug }) => {
        for (const { player, lastMatch, newRank } of changes) {
            debug("Storing new rank");
            await storeNewLoLRank(player.puuid, newRank);

            if (!lastMatch) return;

            await persistLastGameId(player, lastMatch.metadata.matchId, lastMatch.info.gameEndTimestamp);

            // update player name if needed
            const playerInGame = lastMatch?.info.participants.find((p) => p.puuid === player.puuid);
            // @ts-ignore
            const newName = `${playerInGame.riotIdGameName ?? playerInGame.riotIdName}#${playerInGame.riotIdTagline}`;
            if (playerInGame && player.currentName !== newName) {
                await updateSummonerName(player.puuid, newName);
            }
        }
    },
    getLastMatch: async ({ player }) => {
        const lastGame = await getLastGameAndStoreIfNecessary(player);
        if (lastGame?.metadata.matchId === player.lastGameId) return null;

        return lastGame;
    },
    getLastRank: async ({ player }) => {
        const lastRank = await getLoLLastRank(player.puuid);
        return lastRank as InsertRank;
    },
    areRanksEqual: ({ lastRank, newRank }) => {
        return areRanksEqual(lastRank, newRank);
    },
    getDiscordMessages: async ({ changes }) => {
        const messages: StalkerMessage[] = [];

        for (const change of changes) {
            for (const channel of change.player.channels) {
                const embed = await getRankChangeEmbed(change);
                const components = getRankChangeComponents(change);

                // @ts-ignore - discordjs typings are wrong
                messages.push({ channelId: channel, embeds: [embed], components: components });
            }
        }

        return messages;
    },
    getPlayerName: ({ player }) => player.currentName,
    discordNotificationInterval: 1000 * ENV.DISCORD_NOTIFICATION_INTERVAL_SEC,
    playerRequestInterval: 1000 * ENV.PLAYER_REQUEST_INTERVAL_SEC,
});

const getRankChangeComponents = ({ lastMatch, player }: LoLStalkerChange) => {
    if (!lastMatch) return [];

    const participantIndex = lastMatch.info.participants.findIndex((p) => p.puuid === player.puuid);
    const row = getComponentsRow({ matchId: lastMatch.metadata.matchId, participantIndex });

    return [row];
};

const getRankChangeEmbed = async ({ player, lastRank, newRank, lastMatch }: LoLStalkerChange) => {
    if (!lastRank) {
        const embed = await getFirstRankEmbed({ player, newRank, lastMatch });
        return embed;
    }

    const rankDifference = getRankDifference(lastRank, newRank);
    const embed = await getRankDifferenceEmbed({
        player,
        rankDifference,
        newRank,
        lastMatch,
    });

    return embed;
};

type LoLStalkerChange = StalkerChange<SummonerWithChannels, MatchDTO, LoLRankWithWinsLosses, InsertRank>;
