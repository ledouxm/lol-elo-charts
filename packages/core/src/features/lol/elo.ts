import { groupBy } from "pastable";
import { checkBetsAndGetLastGame } from "../bets";
import { sendToChannelId } from "../discord/discord";
import { getAchievedBetsMessageContent } from "../discord/messages";

export const checkBets = async () => {
    const bets = await checkBetsAndGetLastGame();
    if (!bets.length) return;

    const groupedByChannelId = groupBy(bets, (bet) => bet.gambler.channelId);

    for (const channelId in groupedByChannelId) {
        const bets = groupedByChannelId[channelId];

        const betEmbed = await getAchievedBetsMessageContent(bets);
        sendToChannelId({ channelId: bets[0].gambler.channelId, message: { embeds: [betEmbed] } });
    }
};
