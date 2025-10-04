import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { db } from "@/db/db";
import {
    apex,
    arenaPlayer,
    request,
    summoner,
    arenaMatch,
    bet,
    gambler,
    rank,
    match,
    playerOfTheDay,
} from "@/db/schema";
import { valorantMatch, valorantPlayer, valorantRank } from "@/db/valorantSchema";
import { subDays, subMinutes } from "date-fns";
import { and, asc, eq, gte, lte, sql, inArray } from "drizzle-orm";
import { makeDebug } from "@/utils";
import { ENV } from "@/envVars";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";

const debug = makeDebug("router");

export const makeRouter = () => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use("/api", router);

    const port = ENV.HTTP_PORT;

    app.listen(port, "0.0.0.0", () => {
        debug(`Listening on port ${port}`);
    });
};

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (ENV.ADMIN_TOKEN && req.headers.authorization === `Bearer ${ENV.ADMIN_TOKEN}`) {
        return next();
    }
    res.status(403).json({ error: "Forbidden" });
};

const router = express.Router();
router.get("/requests", async (req, res) => {
    const { start, end } = req.query;
    const startD = start ? new Date(start as string) : subMinutes(new Date(), 60);
    const endD = end ? new Date(end as string) : null;

    const requests = await getRequestsBetween(startD, endD);
    res.json(requests);
});

router.get(
    "/export",
    adminMiddleware,
    validateRequest({
        query: z.object({
            channelId: z.string(),
            days: z.coerce.number().default(7),
        }),
    }),
    async (req, res) => {
        try {
            const { channelId, days } = req.query;
            const start = subDays(new Date(), Number(days));

            const summoners = await db
                .select()
                .from(summoner)
                .where(eq(summoner.channelId, channelId as string));

            const gamblers = await db
                .select()
                .from(gambler)
                .where(eq(gambler.channelId, channelId as string));

            const apexes = await db.select().from(apex).where(gte(apex.createdAt, start));
            const arenaMatches = await db.select().from(arenaMatch).where(gte(arenaMatch.endedAt, start));
            const playersOfTheDay = await db
                .select()
                .from(playerOfTheDay)
                .where(and(eq(playerOfTheDay.channelId, channelId as string), gte(playerOfTheDay.createdAt, start)));

            const summonerPuuids = summoners.map((s) => s.puuid);
            const arenaPlayers =
                summonerPuuids.length > 0
                    ? await db.select().from(arenaPlayer).where(inArray(arenaPlayer.puuid, summonerPuuids))
                    : [];

            const ranks =
                summonerPuuids.length > 0
                    ? await db
                          .select()
                          .from(rank)
                          .where(and(inArray(rank.summonerId, summonerPuuids), gte(rank.createdAt, start)))
                    : [];

            const matches =
                summonerPuuids.length > 0
                    ? await db
                          .select()
                          .from(match)
                          .where(and(inArray(match.summonerId, summonerPuuids), gte(match.createdAt, start)))
                    : [];

            const gamblerIds = gamblers.map((g) => g.id);
            const bets =
                gamblerIds.length > 0 ? await db.select().from(bet).where(inArray(bet.gamblerId, gamblerIds)) : [];

            return res.json({
                summoners,
                apexes,
                arenaPlayers,
                arenaMatches,
                gamblers,
                bets,
                ranks,
                matches,
                playersOfTheDay,
            });
        } catch (error) {
            debug("Error exporting data:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

/*
  export interface DB {
    apex: Apex;
    arena_match: ArenaMatch;
    arena_player: ArenaPlayer;
    bet: Bet;
    gambler: Gambler;
    match: Match;
    player_of_the_day: PlayerOfTheDay;
    rank: Rank;
    summoner: Summoner;
    valorant_match: ValorantMatch;
    valorant_player: ValorantPlayer;
    valorant_rank: ValorantRank;
    }
*/

export const getRequestsBetween = async (start: Date, end?: Date) => {
    const where = !end
        ? gte(request.createdAt, start)
        : and(gte(request.createdAt, start), lte(request.createdAt, end));

    const clampMinuteSqlQuery = sql`DATE_TRUNC('minute', ${request.createdAt})`.as("minutes");
    const clampSecondSqlQuery = sql`DATE_TRUNC('second', ${request.createdAt})`.as("seconds");

    const minutes = await db
        .select({ count: sql<number>`COUNT(*)`, date: clampMinuteSqlQuery })
        .from(request)
        .where(where)
        .orderBy(asc(clampMinuteSqlQuery))
        .groupBy(clampMinuteSqlQuery);

    const seconds = await db
        .select({ count: sql<number>`COUNT(*)`, date: clampSecondSqlQuery })
        .from(request)
        .where(where)
        .orderBy(asc(clampSecondSqlQuery))
        .groupBy(clampSecondSqlQuery);

    return { minutes, seconds };
};

export const clearRequests = async () => {
    return db.delete(request);
};
