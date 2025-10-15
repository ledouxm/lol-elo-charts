import { db } from "@/db/db";
import { lolParticipant, match, summoner, summonerPuuidCache } from "@/db/schema";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import express from "express";
import { getSummonerByName } from "../summoner";
import { alias } from "drizzle-orm/pg-core";
import { makeDebug } from "@/utils";

const debug = makeDebug("duoq-router");

export const duoqRouter = express.Router();
duoqRouter.get("/duoq", async (req, res) => {
    const { summoner1, summoner2 } = req.query;

    if (!summoner1 || !summoner2) {
        return res.status(400).json({ error: "Both summoner1 and summoner2 are required" });
    }

    let summonerData1: Awaited<ReturnType<typeof getSummonerPuuidFromDb>>;
    let summonerData2: Awaited<ReturnType<typeof getSummonerPuuidFromDbWithFallback>>;
    let duoqSummary: Awaited<ReturnType<typeof getDuoqMatchSummary>>;

    try {
        summonerData1 = await getSummonerPuuidFromDb(summoner1 as string);
    } catch (error) {
        return res.status(404).json({ error: "Error fetching summoner1" });
    }
    try {
        summonerData2 = await getSummonerPuuidFromDbWithFallback(summoner2 as string);
    } catch (error) {
        return res.status(404).json({ error: "Error fetching summoner2" });
    }

    if (!summonerData1 || !summonerData2) return null;

    try {
        duoqSummary = await getDuoqMatchSummary(summonerData1.puuid, summonerData2.puuid);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Error fetching duoq matches" });
    }

    res.json({
        message: `Duoq endpoint for ${summonerData1.name} and ${summonerData2.name}`,
        duoqSummary,
        summoner1: summonerData1,
        summoner2: summonerData2,
    });
});

duoqRouter.get("/duoq/matches", async (req, res) => {
    try {
        const { cursor, puuid1, puuid2 } = req.query;
        if (!puuid1 || !puuid2) {
            return res.status(400).json({ error: "Both puuid1 and puuid2 are required" });
        }

        const { matchIds } = (await getDuoqMatchSummary(puuid1 as string, puuid2 as string)) ?? { matchIds: [] };

        if (!matchIds?.length) return res.json({ matchIds: [], matches: [] });
        debug(`Total duoq matches found: ${matchIds}, ${!matchIds}`);
        const pageSize = 10;
        const startIndex = cursor ? matchIds.indexOf(cursor as string) : 0;
        const paginatedMatchIds = matchIds.slice(startIndex, startIndex + pageSize);
        const nextCursorIndex = startIndex + pageSize < matchIds.length ? startIndex + pageSize : null;

        const nextCursor = nextCursorIndex !== null ? matchIds[nextCursorIndex] : null;

        console.log({ startIndex, paginatedMatchIds, nextCursor, matchIdLength: matchIds.length });

        const matches = await db
            .select({ details: match.details })
            .from(match)
            .where(inArray(match.matchId, paginatedMatchIds))
            .orderBy(desc(match.matchId));

        res.json({
            matchIds: paginatedMatchIds,
            matches: matches.map((m) => m.details),
            nextCursor,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching matches" });
    }
});

duoqRouter.get("/available-summoners", async (req, res) => {
    const { str } = req.query;
    const summonersQuery = db
        .selectDistinctOn([summoner.puuid])
        .from(summoner)
        .orderBy(asc(summoner.puuid), desc(summoner.lastGameEndedAt))
        .limit(10);

    if (str && typeof str === "string") {
        summonersQuery.where(sql`${summoner.currentName} ILIKE ${"%" + str + "%"}`);
    }

    res.json(
        (await summonersQuery).map((s) => ({
            name: s.currentName,
            puuid: s.puuid,
            icon: s.icon,
        }))
    );
});

export const getSummonerPuuidFromDbWithFallback = async (summonerName: string) => {
    try {
        return await getSummonerPuuidFromDb(summonerName);
    } catch {
        const [name, tag] = summonerName.split("#");
        const summonerFromRiot = await getSummonerByName(name, tag);

        await db.insert(summonerPuuidCache).values({
            puuid: summonerFromRiot.puuid,
            name: summonerFromRiot.fullname,
            icon: summonerFromRiot.profileIconId,
        });

        return {
            puuid: summonerFromRiot.puuid,
            icon: summonerFromRiot.profileIconId,
            name: summonerFromRiot.fullname,
        };
    }
};

export const getSummonerPuuidFromDb = async (summonerName: string) => {
    const formatedName = summonerName.replaceAll(" ", "").toLowerCase();
    const summonerInDb = await db
        .select()
        .from(summoner)
        .where(sql`LOWER(REPLACE(${summoner.currentName}, ' ', '')) = ${formatedName}`)
        .limit(1);

    if (summonerInDb.length > 0)
        return {
            puuid: summonerInDb[0].puuid,
            icon: summonerInDb[0].icon,
            name: summonerInDb[0].currentName,
        };

    const summonerInDbCache = await db
        .select()
        .from(summonerPuuidCache)
        .where(sql`LOWER(REPLACE(${summonerPuuidCache.name}, ' ', '')) = ${formatedName}`)
        .limit(1);

    if (summonerInDbCache.length > 0)
        return {
            puuid: summonerInDbCache[0].puuid,
            icon: summonerInDbCache[0].icon,
            name: summonerInDbCache[0].name,
        };

    throw new Error("Summoner not found in DB");
};

export const getDuoqMatchSummary = async (puuid1: string, puuid2: string) => {
    const p1 = alias(lolParticipant, "p1");
    const p2 = alias(lolParticipant, "p2");

    const result = await db
        .select({
            matchId: p1.matchId,
            win: p1.win,
        })
        .from(p1)
        .innerJoin(p2, eq(p1.matchId, p2.matchId))
        .orderBy(desc(p1.matchId))
        .where(and(eq(p1.puuid, puuid1), eq(p2.puuid, puuid2)));

    const matchIds = result.map((r) => r.matchId);

    const extra = await db
        .select({
            wonTogether: sql<number>`COUNT(CASE WHEN ${p1.win} = true AND ${p2.win} = true THEN 1 END)`.mapWith(Number),
            p1Won: sql<number>`COUNT(CASE WHEN ${p1.win} = true AND ${p2.win} = false THEN 1 END)`.mapWith(Number),
            p2Won: sql<number>`COUNT(CASE WHEN ${p2.win} = true AND ${p1.win} = false THEN 1 END)`.mapWith(Number),
            playedAgainst: sql<number>`COUNT(CASE WHEN ${p1.win} != ${p2.win} THEN 1 END)`.mapWith(Number),
            playedWith: sql<number>`COUNT(CASE WHEN ${p1.win} = ${p2.win} THEN 1 END)`.mapWith(Number),
        })
        .from(p1)
        .innerJoin(p2, eq(p1.matchId, p2.matchId))
        .where(and(eq(p1.puuid, puuid1), eq(p2.puuid, puuid2)));

    const { wonTogether, p1Won, p2Won, playedAgainst, playedWith } = extra[0];

    return {
        totalMatches: result.length,
        wonTogether,
        p1WonAgainstP2: p1Won,
        p2WonAgainstP1: p2Won,
        playedAgainst,
        playedWith,
        matchIds,
    };
};
