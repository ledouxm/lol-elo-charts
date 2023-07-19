import { and, desc, eq, lte } from "drizzle-orm";
import { db } from "./db/db";
import { InsertRank, apex, rank } from "./db/schema";
import { formatRank } from "./utils";
import { getTotalLpFromRank, makeTierData } from "./lps";
import { getSummonersWithChannels } from "./routes";
import { getArrow } from "./getColor";
import { EmbedBuilder } from "discord.js";
import { groupBy } from "pastable";
import { sendToChannelId } from "./discord";

export const generate24hRecap = async () => {
    const summoners = await getSummonersWithChannels();

    const recap = [] as (RecapItem & { channelId: string })[];

    for (const summ of summoners) {
        const todayAtMidnight = new Date();
        todayAtMidnight.setHours(0, 0, 0, 0);

        const yesterdayAtMidnight = new Date(todayAtMidnight);
        yesterdayAtMidnight.setDate(yesterdayAtMidnight.getDate() - 1);

        const yesterdayAtMidnightRank = await db
            .select()
            .from(rank)
            .where(and(lte(rank.createdAt, yesterdayAtMidnight), eq(rank.summonerId, summ.puuid)))
            .orderBy(desc(rank.createdAt))
            .limit(1);

        const todayAtMidnightRank = await db
            .select()
            .from(rank)
            .where(and(lte(rank.createdAt, todayAtMidnight), eq(rank.summonerId, summ.puuid)))
            .orderBy(desc(rank.createdAt))
            .limit(1);

        if (!todayAtMidnightRank?.[0] || !yesterdayAtMidnightRank?.[0]) continue;

        const lastApex = await db.select().from(apex).orderBy(desc(apex.createdAt)).limit(1);

        const yesterdayRank = yesterdayAtMidnightRank?.[0] as InsertRank;
        const todayRank = todayAtMidnightRank?.[0] as InsertRank;

        const yesterdayLp = getTotalLpFromRank(yesterdayRank, makeTierData(lastApex?.[0]));
        const todayLp = getTotalLpFromRank(todayRank, makeTierData(lastApex?.[0]));

        const diff = todayLp - yesterdayLp;
        const isLoss = diff < 0;

        recap.push({
            name: summ.currentName + ": " + (isLoss ? "-" : "+") + Math.abs(diff),
            diff,
            description: `${formatRank(yesterdayRank)} ${getArrow(isLoss)} ${formatRank(todayRank)}`,
            channelId: summ.channelId,
        });
    }

    const byChannelId = groupBy(
        recap.sort((a, b) => b.diff - a.diff),
        (r) => r.channelId
    );

    for (const [channelId, items] of Object.entries(byChannelId)) {
        const embed = await getRecapMessageEmbed(items);
        await sendToChannelId(channelId, embed);
    }
};

const getRecapMessageEmbed = async (items: RecapItem[]) => {
    const embed = new EmbedBuilder()
        .setTitle("24h Recap")
        .setFields(items.map((i) => ({ name: i.name, value: i.description })));

    return embed;
};

type RecapItem = {
    name: string;
    diff: number;
    description: string;
};
