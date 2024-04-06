import { InsertRank } from "@/db/schema";
import { MatchDTO } from "galeforce/dist/galeforce/interfaces/dto";
import { Stalker, StalkerChange, StalkerMessage } from "../stalker";
import { getComponentsRow, getFirstRankEmbed, getRankDifferenceEmbed } from "./embeds";
import { getLastGameAndStoreIfNecessary } from "./match";
import { LoLRankWithWinsLosses, getLoLLastRank, getLoLNewRank, storeNewLoLRank } from "./rank";
import { areRanksEqual, getRankDifference } from "./rankUtils";
import { SummonerWithChannels, getSummonersWithChannels, updateName } from "./summoner";

export const lolStalker = new Stalker({
    debugNamespace: "lol",
    getPlayers: async () => {
        const summoners = await getSummonersWithChannels();
        return summoners;
    },
    getRank: async ({ player }) => {
        const rank = await getLoLNewRank(player.id);
        return rank;
    },
    storeNewRank: async ({ player, newRank }) => {
        await storeNewLoLRank(player.puuid, newRank);
    },
    getLastMatch: async ({ player }) => {
        const lastGame = await getLastGameAndStoreIfNecessary(player);

        // if no new game
        if (lastGame.metadata.matchId === player.lastGameId) return null;

        // update player name if needed
        const playerInGame = lastGame.info.participants.find((p) => p.puuid === player.puuid);
        if (playerInGame && player.currentName !== `${playerInGame.summonerName}#${playerInGame.riotIdTagline}`) {
            await updateName(player.puuid, `${playerInGame.summonerName}#${playerInGame.riotIdTagline}`);
        }

        return lastGame;
    },
    getLastRank: async ({ player }) => {
        const lastRank = await getLoLLastRank(player.puuid);
        return lastRank;
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
    discordNotificationInterval: 1000 * 60,
    playerRequestInterval: 5000,
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
