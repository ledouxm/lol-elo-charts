import { EmbedBuilder } from "@discordjs/builders";
import { and, eq } from "drizzle-orm";
import Galeforce from "galeforce";
import { db } from "../db/db";
import { Summoner, gambler, request, summoner } from "../db/schema";

export const addRequest = async () => {
    try {
        await db.insert(request).values({ createdAt: new Date() });
    } catch (e) {
        console.log("cant insert request", e);
    }
};
export const galeforce = new Galeforce({ "riot-api": { key: process.env.RG_API_KEY } });

export const getSummonerByName = async (name: string, tag: string) => {
    const account = await galeforce.riot.account
        .account()
        .gameName(name)
        .tagLine(tag)
        .region(galeforce.region.riot.EUROPE)
        .exec();
    const summoner = await galeforce.lol
        .summoner()
        .region(galeforce.region.lol.EUROPE_WEST)
        .puuid(account.puuid)
        .exec();
    return { ...summoner, fullname: `${account.gameName}#${account.tagLine}` };
};

export const getQueueRank = async (tier: Galeforce.Tier) => {
    const queue = await galeforce.lol.league
        .league()
        .queue(galeforce.queue.lol.RANKED_SOLO)
        .region(galeforce.region.lol.EUROPE_WEST)
        .tier(tier)
        .exec();
    await addRequest();

    return queue;
};

export const addSummoner = async (
    riotSummoner: Galeforce.dto.SummonerDTO & { fullname: string },
    channelId: string
) => {
    try {
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
                .set({ isActive: true, currentName: riotSummoner.fullname })
                .where(eq(summoner.puuid, riotSummoner.puuid));

            return identifier;
        }

        await db.insert(summoner).values({
            puuid: riotSummoner.puuid,
            id: riotSummoner.id,
            channelId,
            icon: riotSummoner.profileIconId,
            currentName: riotSummoner.fullname,
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

// export const getRankEmbed =

export const getSummonerCurrentGame = async (summonerId: string) => {
    try {
        const activeGame = await galeforce.lol.spectator
            .active()
            .region(galeforce.region.lol.EUROPE_WEST)
            .summonerId(summonerId)
            .exec();
        await addRequest();

        if (!activeGame || activeGame.gameQueueConfigId !== 420) return null;
        return activeGame;
    } catch {
        return null;
    }
};
