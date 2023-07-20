import { EmbedBuilder } from "@discordjs/builders";
import { InferModel, and, eq } from "drizzle-orm";
import Galeforce from "galeforce";
import { db } from "../db/db";
import { gambler, summoner } from "../db/schema";
import { MinimalRank, formatRank, getArrow, getColor, getEmoji, getRankDifference } from "../utils";
import { getProfileIconUrl } from "./icons";

export const galeforce = new Galeforce({ "riot-api": { key: process.env.RG_API_KEY } });

export const addSummoner = async (name: string, channelId: string) => {
    try {
        const riotSummoner = await galeforce.lol.summoner().region(galeforce.region.lol.EUROPE_WEST).name(name).exec();

        const identifier = { puuid: summoner.puuid, channelId };

        const existing = (
            await db
                .select()
                .from(summoner)
                .where(and(eq(summoner.puuid, riotSummoner.puuid), eq(summoner.channelId, channelId)))
                .limit(1)
        )?.[0];
        if (existing) {
            await db
                .update(summoner)
                .set({ isActive: true, currentName: riotSummoner.name })
                .where(eq(summoner.puuid, riotSummoner.puuid));

            return identifier;
        }

        await db.insert(summoner).values({
            puuid: riotSummoner.puuid,
            id: riotSummoner.id,
            channelId,
            icon: riotSummoner.profileIconId,
            currentName: riotSummoner.name,
        });

        return identifier;
    } catch (e) {
        console.log(e);
        throw e;
    }
};

export const removeSummoner = async (name: string, channelId: string) => {
    try {
        const existing = (
            await db
                .select()
                .from(summoner)
                .where(and(eq(summoner.currentName, name), eq(summoner.channelId, channelId)))
                .limit(1)
        )?.[0];

        if (!existing) throw new Error("Summoner not found");

        await db
            .update(summoner)
            .set({ isActive: false })
            .where(and(eq(summoner.currentName, name), eq(summoner.channelId, channelId)));

        return "ok";
    } catch (e) {
        console.log(e);
        throw e;
    }
};

export const giveEveryone500Points = async () => {
    const gamblers = await db.select().from(gambler);

    for (const g of gamblers) {
        await db
            .update(gambler)
            .set({ points: g.points + 500 })
            .where(eq(gambler.id, gambler.id));
    }
};

export const getSummonersWithChannels = async () => {
    const allSummoners = await db.select().from(summoner).where(eq(summoner.isActive, true));
    const summoners = allSummoners.reduce((acc, s) => {
        const index = acc.findIndex((a) => a.puuid === s.puuid);
        if (index !== -1) {
            acc[index].channels.push(s.channelId);
        } else acc.push({ ...s, channels: [s.channelId] });

        return acc;
    }, [] as (InferModel<typeof summoner, "select"> & { channels: string[] })[]);

    return summoners;
};

export const getRankDifferenceMessageContent = async ({
    lastRank,
    rank,
    summ,
    elo,
}: {
    lastRank: MinimalRank;
    rank: MinimalRank;
    summ: InferModel<typeof summoner, "select">;
    elo: Galeforce.dto.LeagueEntryDTO;
}) => {
    const profileIcon = await getProfileIconUrl(summ.icon);
    if (!lastRank) {
        return new EmbedBuilder()
            .setColor(0xfbfaa6)
            .setTitle(`${summ.currentName}`)
            .setFields([
                {
                    name: `is now ${formatRank(rank)}`,
                    value: " ",
                },
            ])
            .setThumbnail(profileIcon);
    }
    const rankDifference = getRankDifference(lastRank, rank);

    const isLoss = ["DEMOTION", "LOSS"].includes(rankDifference.type);

    const embed = new EmbedBuilder()
        .setColor(getColor(isLoss))
        .setTitle(summ.currentName)
        .setThumbnail(profileIcon)
        .setFields([
            {
                name: `${getEmoji(isLoss)} ${rankDifference.content}`,
                value: `${rankDifference.from} ${getArrow(isLoss)} ${rankDifference.to}`,
            },
            {
                name: "Wins",
                value: elo.wins.toString(),
                inline: true,
            },
            {
                name: "Losses",
                value: elo.losses.toString(),
                inline: true,
            },
            {
                name: "Winrate",
                value: `${((elo.wins / (elo.wins + elo.losses)) * 100).toFixed(2)}%`,
                inline: true,
            },
        ]);

    return embed;
};

export const getSummonerCurrentGame = async (summonerId: string) => {
    try {
        const activeGame = await galeforce.lol.spectator
            .active()
            .region(galeforce.region.lol.EUROPE_WEST)
            .summonerId(summonerId)
            .exec();

        if (!activeGame || activeGame.gameQueueConfigId !== 420) return null;
        return activeGame;
    } catch {
        return null;
    }
};
