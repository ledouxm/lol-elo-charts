import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db/db";
import { InsertRank, apex, bet, gambler, rank, summoner } from "../db/schema";
import { formatRank } from "../utils";
import { getTotalLpFromRank, makeTierData } from "./lol/lps";
import { getSummonersWithChannels } from "./summoner";
import { getArrow } from "../utils";
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
    const recap = [] as (RecapItem & { channelId: string })[];

    const lastApex = (await db.select().from(apex).orderBy(desc(apex.createdAt)).limit(1))?.[0];

    for (const summ of summoners) {
        const samePuuid = eq(rank.summonerId, summ.puuid);

        const { startRank, endRank } = await getTodaysRanks(samePuuid);

        console.log(startRank);

        if (!endRank || !startRank) continue;

        // if start and end rank are the same, skip
        if (startRank.id === endRank.id) continue;

        const startLp = getTotalLpFromRank(startRank, makeTierData(lastApex));
        const endLp = getTotalLpFromRank(endRank, makeTierData(lastApex));

        const diff = endLp - startLp;
        const isLoss = diff < 0;

        summ.channels.forEach((channelId) => {
            recap.push({
                name: summ.currentName + ": " + (isLoss ? "-" : "+") + Math.abs(diff),
                diff,
                description: `${formatRank(startRank)} ⮞ ${formatRank(endRank)}`,
                channelId: channelId,
            });
        });
    }

    const byChannelId = groupBy(
        recap.sort((a, b) => b.diff - a.diff),
        (r) => r.channelId
    );

    for (const [channelId, items] of Object.entries(byChannelId)) {
        const embed = getRecapMessageEmbed(items);
        const file = await generateRankGraph(channelId, lastApex);

        await sendToChannelId({ channelId, embed, file });
    }
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
