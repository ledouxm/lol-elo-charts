import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db/db";
import { InsertRank, apex, bet, gambler, rank } from "../db/schema";
import { formatRank } from "../utils";
import { getTotalLpFromRank, makeTierData } from "./lps";
import { getSummonersWithChannels } from "./summoner";
import { getArrow } from "../utils";
import { groupBy } from "pastable";
import { sendToChannelId } from "../discord";
import * as DateFns from "date-fns";
import { RecapItem, getRecapMessageEmbed, getBetsRecapMessageEmbed } from "./messages";

export const generate24hRecaps = async () => {
    await generate24hRankRecap();
    await generate24hBetsRecap();
};

export const generate24hRankRecap = async () => {
    const summoners = await getSummonersWithChannels();

    const recap = [] as (RecapItem & { channelId: string })[];

    for (const summ of summoners) {
        const startOfYesterday = DateFns.addHours(DateFns.startOfYesterday(), 2);
        const endOfYesterday = DateFns.addHours(DateFns.endOfYesterday(), 2);

        const startRanks = await db
            .select()
            .from(rank)
            .where(and(lte(rank.createdAt, startOfYesterday), eq(rank.summonerId, summ.puuid)))
            .orderBy(desc(rank.createdAt))
            .limit(1);

        const endRanks = await db
            .select()
            .from(rank)
            .where(and(lte(rank.createdAt, endOfYesterday), eq(rank.summonerId, summ.puuid)))
            .orderBy(desc(rank.createdAt))
            .limit(1);

        if (!endRanks?.[0] || !startRanks?.[0]) continue;

        const lastApex = await db.select().from(apex).orderBy(desc(apex.createdAt)).limit(1);

        const startRank = startRanks?.[0] as InsertRank;
        const endRank = endRanks?.[0] as InsertRank;

        const startLp = getTotalLpFromRank(startRank, makeTierData(lastApex?.[0]));
        const endLp = getTotalLpFromRank(endRank, makeTierData(lastApex?.[0]));

        const diff = endLp - startLp;
        const isLoss = diff < 0;

        recap.push({
            name: summ.currentName + ": " + (isLoss ? "-" : "+") + Math.abs(diff),
            diff,
            description: `${startRank.id}:${endRank.id} ${formatRank(startRank)} ${getArrow(isLoss)} ${formatRank(
                endRank
            )}`,
            channelId: summ.channelId,
        });
    }

    const byChannelId = groupBy(
        recap.sort((a, b) => b.diff - a.diff),
        (r) => r.channelId
    );

    for (const [channelId, items] of Object.entries(byChannelId)) {
        const embed = getRecapMessageEmbed(items);
        await sendToChannelId(channelId, embed);
    }
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
        await sendToChannelId(channelId, embed);
    }
};

export const getAllEndedBets = async ({ startDate, endDate }: { startDate?: Date; endDate?: Date }) => {
    const query = db
        .select({
            gamblerId: bet.gamblerId,
            channelId: gambler.channelId,
            wins: sql<number>`SUM(CASE WHEN is_win = TRUE THEN 1 ELSE 0 END)`,
            losses: sql<number>`SUM(CASE WHEN is_win = FALSE THEN 1 ELSE 0 END)`,
            result: sql<number>`SUM(CASE WHEN is_win = TRUE THEN bet.points ELSE -bet.points END)`,
        })
        .from(bet)
        .leftJoin(gambler, eq(gambler.id, bet.gamblerId))
        .groupBy(bet.gamblerId, gambler.channelId);

    if (startDate && endDate) query.where(and(lte(bet.createdAt, endDate), gte(bet.createdAt, startDate)));

    return query;
};
