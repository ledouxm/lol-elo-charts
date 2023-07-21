import { desc, eq } from "drizzle-orm";
import { db } from "../db/db";
import { InsertRank, rank, summoner } from "../db/schema";
import { sendToChannelId } from "../discord";
import { areRanksEqual } from "../utils";
import { getSummonersWithChannels, getRankDifferenceMessageContent } from "./summoner";
import { checkBetsAndGetLastGame } from "./bets";
import { getAchievedBetsMessageContent } from "./messages";
import { groupBy } from "pastable";
import { getSoloQElo, getSummonerData } from "./lol/summoner";

export const checkElo = async () => {
    const summoners = await getSummonersWithChannels();

    console.log(
        "checking elo for summoners: ",
        summoners
            .map((s) => `${s.currentName} (${s.channels.length} channel${s.channels.length > 1 ? "s" : ""})`)
            .join(", "),
        " at ",
        new Date().toISOString()
    );

    for (const summ of summoners) {
        try {
            const summonerData = await getSummonerData(summ.puuid);

            if (summonerData.name !== summ.currentName) {
                await db.update(summoner).set({ currentName: summonerData.name }).where(eq(summoner.puuid, summ.puuid));
            }

            const elo = await getSoloQElo(summ.id);
            if (!elo) continue;

            const newRank = {
                tier: elo.tier as InsertRank["tier"],
                division: elo.rank as InsertRank["division"],
                leaguePoints: elo.leaguePoints,
            };

            const lastRanks = await db
                .select()
                .from(rank)
                .where(eq(rank.summonerId, summ.puuid))
                .orderBy(desc(rank.createdAt))
                .limit(1);

            const lastRank = lastRanks?.[0] as InsertRank;

            await db
                .update(summoner)
                .set({ icon: summonerData.profileIconId, currentName: summonerData.name, checkedAt: new Date() })
                .where(eq(summoner.puuid, summ.puuid));

            if (lastRank && areRanksEqual(lastRank, newRank)) continue;

            await db.insert(rank).values({
                summonerId: summ.puuid!,
                ...newRank,
            });

            // send summoner update to every channel he is watched in
            const embedBuilder = await getRankDifferenceMessageContent({ lastRank, rank: newRank, summ, elo });
            summ.channels.forEach((channel) => sendToChannelId(channel, embedBuilder));
        } catch (e) {
            console.log(e);
        }
    }
};

export const checkBets = async () => {
    const bets = await checkBetsAndGetLastGame();
    if (!bets.length) return;

    const groupedByGambler = groupBy(bets, (bet) => bet.gambler.id);
    console.log("groupedByGambler", Object.keys(groupedByGambler));
    for (const gamblerId in groupedByGambler) {
        const bets = groupedByGambler[gamblerId];

        const betEmbed = await getAchievedBetsMessageContent(bets);
        sendToChannelId(bets[0].gambler.channelId, betEmbed);
    }
};
