import { desc, eq } from "drizzle-orm";
import { db } from "../../db/db";
import { InsertRank, Summoner, rank, summoner } from "../../db/schema";
import { sendToChannelId } from "../discord/discord";
import { MinimalRank, areRanksEqual, RankDifference, getRankDifference } from "../../utils";
import { getSummonersWithChannels, getFirstRankEmbed, getRankDifferenceEmbed, SummonerWithChannels } from "../summoner";
import { checkBetsAndGetLastGame, getLastGame, insertMatchFromMatchDto } from "../bets";
import { getAchievedBetsMessageContent } from "../discord/messages";
import { groupBy } from "pastable";
import { getSoloQElo, getSummonerData } from "./summoner";
import Galeforce from "galeforce";

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
            await checkSummonerElo(summ);
        } catch (e) {
            console.log(e);
        }
    }
};

export const checkSummonerElo = async (summ: SummonerWithChannels) => {
    const summonerData = await getSummonerData(summ.puuid);

    if (summonerData.name !== summ.currentName) {
        await db.update(summoner).set({ currentName: summonerData.name }).where(eq(summoner.puuid, summ.puuid));
    }

    const elo = await getSoloQElo(summ.id);
    if (!elo) return;

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

    if (lastRank && areRanksEqual(lastRank, newRank)) return;

    await db.insert(rank).values({
        summonerId: summ.puuid!,
        ...newRank,
    });

    // send summoner update to every channel he is watched in
    const { embed, lastGame } = await getCheckEloEmbed({ lastRank, newRank, summ, elo });
    summ.channels.forEach((channel) => sendToChannelId({ channelId: channel, embed }));

    if (lastGame) {
        await db.update(summoner).set({ lastGameId: lastGame.metadata.matchId }).where(eq(summoner.puuid, summ.puuid));

        await insertMatchFromMatchDto(lastGame, summ.puuid!);
    }
};

const getNewLastGameIfExists = async (summ: Summoner) => {
    const lastGame = await getLastGame(summ);
    return lastGame.metadata.matchId === summ?.lastGameId ? null : lastGame;
};

export const getCheckEloEmbed = async ({
    summ,
    lastRank,
    newRank,
    elo,
}: {
    summ: Summoner;
    lastRank: MinimalRank;
    newRank: MinimalRank;
    elo: Galeforce.dto.LeagueEntryDTO;
}) => {
    const lastGame = await getNewLastGameIfExists(summ);

    if (!lastRank) {
        const embed = await getFirstRankEmbed(summ, newRank, elo, lastGame);
        return { embed, lastGame };
    }

    const rankDifference = getRankDifference(lastRank, newRank);
    const embed = await getRankDifferenceEmbed({ summ, rankDifference, elo, lastGame });

    return { embed, lastGame };
};

export const checkBets = async () => {
    const bets = await checkBetsAndGetLastGame();
    if (!bets.length) return;

    const groupedByChannelId = groupBy(bets, (bet) => bet.gambler.channelId);

    for (const channelId in groupedByChannelId) {
        const bets = groupedByChannelId[channelId];

        const betEmbed = await getAchievedBetsMessageContent(bets);
        sendToChannelId({ channelId: bets[0].gambler.channelId, embed: betEmbed });
    }
};
