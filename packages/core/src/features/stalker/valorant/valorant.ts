import { InsertValorantRank } from "@/db/valorantSchema";
import { Stalker, StalkerMessage } from "../stalker";
import { ValorantMatch, ValorantMmr, ValorantPlayerWithChannels, ValorantService } from "./ValorantService";
import { getValorantPlayersWithChannels, persistLastValorantGameId } from "./player";
import { getValorantLastRank, storeNewValorantRank } from "./mmr";

const valorantStalker = new Stalker<ValorantPlayerWithChannels, ValorantMatch, ValorantMmr, InsertValorantRank>({
    debugNamespace: "valorant",
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
        return ValorantService.getLastGame(player.puuid);
    },
    getLastRank: async ({ player }) => {
        return getValorantLastRank(player.puuid);
    },
    areRanksEqual: ({ lastRank, newRank }) => {
        return lastRank.elo === newRank.elo;
    },
    getDiscordMessages: async ({ changes }) => {
        const messages: StalkerMessage[] = [];

        for (const change of changes) {
            for (const channel of change.player.channels) {
            }
        }

        return messages;
    },
    getPlayerName: ({ player }) => player.currentName,
    discordNotificationInterval:
        1000 *
        (process.env.DISCORD_NOTIFICATION_INTERVAL_SEC ? Number(process.env.DISCORD_NOTIFICATION_INTERVAL_SEC) : 10),
    playerRequestInterval:
        1000 * (process.env.PLAYER_REQUEST_INTERVAL_SEC ? Number(process.env.PLAYER_REQUEST_INTERVAL_SEC) : 10),
});
