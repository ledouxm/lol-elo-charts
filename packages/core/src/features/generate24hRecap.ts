import { and, desc, eq, gt, gte, lte, not, sql } from "drizzle-orm";
import { db } from "../db/db";
import { Summoner, apex, bet, gambler, match, playerOfTheDay, rank, summoner } from "../db/schema";
import { formatRank } from "../utils";
import { getTotalLpFromRank, makeTierData } from "./lol/lps";
import { getSummonersWithChannels } from "./summoner";
import { groupBy } from "pastable";
import { sendToChannelId } from "./discord/discord";
import * as DateFns from "date-fns";
import { RecapItem, getRecapMessageEmbed, getBetsRecapMessageEmbed } from "./discord/messages";
import { generateRankGraph } from "./chart/generateGraph";

export const generate24hRecaps = async () => {
    await generate24hRankRecap();
    await generate24hBetsRecap();
};

export const generate24hRankRecap = async () => {
    const summoners = await getSummonersWithChannels();
    const recap = [] as (RecapItem & { channelId: string; summoner: Summoner })[];

    const lastApex = (await db.select().from(apex).orderBy(desc(apex.createdAt)).limit(1))?.[0];

    for (const summ of summoners) {
        const samePuuid = eq(rank.summonerId, summ.puuid);

        const { startRank, endRank } = await getTodaysRanks(samePuuid);

        if (!endRank || !startRank) continue;

        // if start and end rank are the same, skip
        if (startRank.id === endRank.id) continue;

        const startLp = getTotalLpFromRank(startRank, makeTierData(lastApex));
        const endLp = getTotalLpFromRank(endRank, makeTierData(lastApex));

        const diff = endLp - startLp;
        const isLoss = diff < 0;

        const winRate = await getYesterdayWinRate(summ);
        const winRateString = winRate ? ` (${winRate.wins}W/${winRate.losses}L)` : "";

        summ.channels.forEach((channelId) => {
            recap.push({
                name: summ.currentName + ": " + (isLoss ? "-" : "+") + Math.abs(diff) + winRateString,
                diff,
                description: `${formatRank(startRank)} ⮞ ${formatRank(endRank)}`,
                channelId: channelId,
                summoner: summ,
            });
        });
    }

    const byChannelId = groupBy(
        recap.sort((a, b) => b.diff - a.diff),
        (r) => r.channelId
    );

    for (const [channelId, items] of Object.entries(byChannelId)) {
        const streaksAndCounts = await getWinnerAndLoserStreakAndCount({
            winner: items[0].summoner,
            loser: items[items.length - 1].summoner,
        });

        const embed = getRecapMessageEmbed(items, streaksAndCounts);
        const file = await generateRankGraph(channelId, lastApex);

        await sendToChannelId({ channelId, embed, file });
    }
};

const getWinnerAndLoserStreakAndCount = async ({ winner, loser }: { winner: Summoner; loser: Summoner }) => {
    const winnerStreak = await getStreak({ summoner: winner, channelId: winner.channelId, type: "winner" });
    const loserStreak = await getStreak({ summoner: loser, channelId: loser.channelId, type: "loser" });

    const winnerCount = await getNbPlayerOfTheDay({ summoner: winner, channelId: winner.channelId, type: "winner" });
    const loserCount = await getNbPlayerOfTheDay({ summoner: loser, channelId: loser.channelId, type: "loser" });

    return { winnerStreak, loserStreak, winnerCount, loserCount };
};

const storePlayersOfTheDay = async ({
    items,
    channelId,
}: {
    items: (RecapItem & { summoner: Summoner })[];
    channelId: string;
}) => {
    const winner = items[0].summoner;
    const loser = items[items.length - 1].summoner;

    const winStreak = await db
        .select({
            winStreak: sql<number>`COUNT(*)`,
        })
        .from(match)
        .where(and(eq(match.summonerId, winner.puuid), eq(match.isWin, true)));

    await db.insert(playerOfTheDay).values([
        { summonerId: items[0].summoner.puuid, type: "winner", channelId },
        { summonerId: items[items.length - 1].summoner.puuid, type: "loser", channelId },
    ]);
};

export const getNbPlayerOfTheDay = async ({
    summoner,
    channelId,
    type,
}: {
    summoner: Summoner;
    channelId: string;
    type: "winner" | "loser";
}) => {
    const nbPlayersOfTheDay = await db
        .select({
            nbPlayersOfTheDay: sql<string>`COUNT(*)`,
        })
        .from(playerOfTheDay)
        .where(
            and(
                eq(playerOfTheDay.channelId, channelId),
                eq(playerOfTheDay.type, type),
                eq(playerOfTheDay.summonerId, summoner.puuid)
            )
        );

    return Number(nbPlayersOfTheDay[0].nbPlayersOfTheDay) + 1;
};

export const getStreak = async ({
    summoner,
    channelId,
    type,
}: {
    summoner: Summoner;
    channelId: string;
    type: "winner" | "loser";
}) => {
    const channelPlayersOfTheDay = db
        .select()
        .from(playerOfTheDay)
        .where(and(eq(playerOfTheDay.channelId, channelId), eq(playerOfTheDay.type, type)))
        .orderBy(desc(playerOfTheDay.createdAt))
        .as("channelPlayersOfTheDay");

    const lastTimePlayerOfTheDayWasntSummoner = await db
        .select({
            lastLost: sql<Date>`MAX(created_at)`,
        })
        .from(channelPlayersOfTheDay)
        .where(not(eq(channelPlayersOfTheDay.summonerId, summoner.puuid)));

    const nbPlayersOfTheDayBetweenLastTimeAndNow = await db
        .select({
            nbPlayersOfTheDay: sql<string>`COUNT(*)`,
        })
        .from(channelPlayersOfTheDay)
        .where(
            and(
                eq(channelPlayersOfTheDay.channelId, channelId),
                eq(channelPlayersOfTheDay.type, type),
                gt(channelPlayersOfTheDay.createdAt, lastTimePlayerOfTheDayWasntSummoner[0].lastLost)
            )
        );

    return Number(nbPlayersOfTheDayBetweenLastTimeAndNow[0].nbPlayersOfTheDay) + 1;
};

export const getYesterdayWinRate = async (summ: Summoner) => {
    const start = DateFns.startOfYesterday();
    const end = DateFns.endOfYesterday();

    const wins = await db
        .select({
            wins: sql<number>`SUM(CASE WHEN is_win = TRUE THEN 1 ELSE 0 END)`,
            losses: sql<number>`SUM(CASE WHEN is_win = FALSE THEN 1 ELSE 0 END)`,
        })
        .from(match)
        .where(and(eq(match.summonerId, summ.puuid), gte(match.endedAt, start), lte(match.endedAt, end)))
        .groupBy(match.summonerId);

    return wins[0];
};

export const getTodaysRanks = async (additionnalWhereStatements?: any) => {
    const startOfYesterday = DateFns.startOfYesterday();
    const endOfYesterday = DateFns.endOfYesterday();

    const select = {
        id: rank.id,
        summonerId: rank.summonerId,
        tier: rank.tier,
        division: rank.division,
        leaguePoints: rank.leaguePoints,
        createdAt: rank.createdAt,
        name: summoner.currentName,
        channelId: summoner.channelId,
    };

    const startRanks = await db
        .select(select)
        .from(rank)
        .where(and(lte(rank.createdAt, startOfYesterday), additionnalWhereStatements))
        .orderBy(desc(rank.createdAt))
        .leftJoin(summoner, eq(summoner.puuid, rank.summonerId))
        .limit(1);

    const dayRanks = await db
        .select(select)
        .from(rank)
        .where(
            and(lte(rank.createdAt, endOfYesterday), gte(rank.createdAt, startOfYesterday), additionnalWhereStatements)
        )
        .leftJoin(summoner, eq(summoner.puuid, rank.summonerId))
        .orderBy(desc(rank.createdAt));

    return { startRank: startRanks?.[0], endRank: dayRanks?.[0], dayRanks };
};

/**
 * SELECT gambler_id, 
       SUM(CASE WHEN is_win = TRUE THEN 1 ELSE 0 END) AS wins,
       SUM(CASE WHEN is_win = FALSE THEN 1 ELSE 0 END) AS losses,
       SUM(CASE WHEN is_win = TRUE THEN points ELSE -points END) AS earnings
FROM bet
GROUP BY gambler_id;
 */

export const generate24hBetsRecap = async () => {
    const startOfYesterday = DateFns.addHours(DateFns.startOfYesterday(), 2);
    const endOfYesterday = DateFns.addHours(DateFns.endOfYesterday(), 2);

    const allEndedBets = (await getAllEndedBets({ startDate: startOfYesterday, endDate: endOfYesterday })).sort(
        (a, b) => b.result - a.result
    );

    const groupedByChannelId = groupBy(allEndedBets, (b) => b.channelId);

    for (const [channelId, bets] of Object.entries(groupedByChannelId)) {
        const embed = getBetsRecapMessageEmbed(bets);
        await sendToChannelId({ channelId, embed });
    }
};

export const getAllEndedBets = async ({ startDate, endDate }: { startDate?: Date; endDate?: Date }) => {
    const query = db
        .select({
            gamblerId: bet.gamblerId,
            channelId: gambler.channelId,
            name: gambler.name,
            wins: sql<number>`SUM(CASE WHEN is_win = TRUE THEN 1 ELSE 0 END)`,
            losses: sql<number>`SUM(CASE WHEN is_win = FALSE THEN 1 ELSE 0 END)`,
            result: sql<number>`SUM(CASE WHEN is_win = TRUE THEN bet.points ELSE -bet.points END)`,
        })
        .from(bet)
        .leftJoin(gambler, eq(gambler.id, bet.gamblerId))
        .groupBy(bet.gamblerId, gambler.channelId, gambler.name);

    if (startDate && endDate) query.where(and(lte(bet.createdAt, endDate), gte(bet.createdAt, startDate)));

    return query;
};
