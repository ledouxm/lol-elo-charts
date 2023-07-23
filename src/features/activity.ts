import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { Participant, getSummonerCurrentGame, getSummonersWithChannels } from "./summoner";
import { summoner } from "@/db/schema";
import { EmbedBuilder } from "@discordjs/builders";
import { getChampionById, getChampionIconUrl } from "./lol/icons";
import { sendToChannelId } from "./discord/discord";
import { formatDistanceToNow } from "date-fns";

export const getInGameSummoners = async () => {
    const summoners = await getSummonersWithChannels();
    for (const summ of summoners) {
        try {
            const activeGame = await getSummonerCurrentGame(summ.id);
            if (!activeGame) continue;

            const matchId = "EUW1_" + activeGame.gameId;
            if (matchId === summ.lastNotifiedInGameId) continue;

            await db.update(summoner).set({ lastNotifiedInGameId: matchId }).where(eq(summoner.id, summ.id));

            const participant = activeGame.participants.find((p) => p.summonerId == summ.id);
            const champion = await getChampionById(participant.championId);

            const championUrl = await getChampionIconUrl(champion.id);

            for (const channelId of summ.channels) {
                const embed = new EmbedBuilder()
                    .setColor(0xfbfaa6)
                    .setTitle(`${summ.currentName} is in game`)
                    .setDescription(`Playing **${champion.name}**`)
                    .setThumbnail(championUrl)
                    .setTimestamp(new Date(activeGame.gameStartTime));

                await sendToChannelId({ embed, channelId });
            }
        } catch (e) {
            console.log(e);
        }
    }
};
