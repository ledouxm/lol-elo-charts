import { Effect } from "effect";
import { sql } from "kysely";
import { PgDB } from "../db";

export const getActiveBets = () =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        return yield* db
            .selectFrom("bet")
            .innerJoin("gambler", "gambler.id", "bet.gambler_id")
            .innerJoin("summoner", "summoner.puuid", "bet.summoner_id")
            .selectAll()
            .where("bet.ended_at", "is", null);
    });

export const getActiveBetsByGambler = (gamblerId: number) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        return yield* db
            .selectFrom("bet")
            .selectAll()
            .where("gambler_id", "=", gamblerId)
            .where("ended_at", "is", null);
    });

export const getActiveBetForGamblerAndSummoner = (gamblerId: number, summonerId: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db
            .selectFrom("bet")
            .selectAll()
            .where("gambler_id", "=", gamblerId)
            .where("summoner_id", "=", summonerId)
            .where("ended_at", "is", null)
            .limit(1);
        return rows[0] ?? null;
    });

export const getActiveBetsByChannel = (channelId: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        return yield* db
            .selectFrom("bet")
            .innerJoin("summoner", "summoner.puuid", "bet.summoner_id")
            .innerJoin("gambler", "gambler.id", "bet.gambler_id")
            .selectAll()
            .where("summoner.channel_id", "=", channelId)
            .where("bet.ended_at", "is", null);
    });

export const getMyActiveBets = (discordId: string, channelId: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        return yield* db
            .selectFrom("bet")
            .innerJoin("summoner", "summoner.puuid", "bet.summoner_id")
            .innerJoin("gambler", "gambler.id", "bet.gambler_id")
            .selectAll()
            .where("gambler.discord_id", "=", discordId)
            .where("gambler.channel_id", "=", channelId)
            .where("bet.ended_at", "is", null);
    });

export const insertBet = (values: {
    gambler_id: number;
    summoner_id: string;
    points: number;
    has_bet_on_win: boolean;
    odds: string;
}) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.insertInto("bet").values(values);
    });

export const resolveBet = (betId: number, isWin: boolean, matchId: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db
            .updateTable("bet")
            .set({ ended_at: new Date(), is_win: isWin, match_id: matchId })
            .where("id", "=", betId);
    });

export const getBetWithRelations = (betId: number) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db
            .selectFrom("bet")
            .innerJoin("gambler", "gambler.id", "bet.gambler_id")
            .innerJoin("summoner", "summoner.puuid", "bet.summoner_id")
            .selectAll()
            .where("bet.id", "=", betId)
            .limit(1);
        return rows[0] ?? null;
    });

export const getLeaderboard = (channelId: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        return yield* db
            .selectFrom("gambler")
            .leftJoin("bet", "bet.gambler_id", "gambler.id")
            .select([
                "gambler.id",
                "gambler.name",
                "gambler.points",
                sql<number>`SUM(CASE WHEN bet.is_win = TRUE THEN 1 ELSE 0 END)`.as("wins"),
                sql<number>`SUM(CASE WHEN bet.is_win = FALSE THEN 1 ELSE 0 END)`.as("losses"),
            ])
            .where("gambler.channel_id", "=", channelId)
            .groupBy(["gambler.id", "gambler.name", "gambler.points"])
            .orderBy("gambler.points", "desc");
    });

export const getBetsRecapByChannel = (channelId: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        return yield* db
            .selectFrom("bet")
            .innerJoin("gambler", "gambler.id", "bet.gambler_id")
            .select([
                "gambler.id",
                "gambler.name",
                sql<number>`SUM(CASE WHEN bet.is_win = TRUE THEN 1 ELSE 0 END)`.as("wins"),
                sql<number>`SUM(CASE WHEN bet.is_win = FALSE THEN 1 ELSE 0 END)`.as("losses"),
            ])
            .where("gambler.channel_id", "=", channelId)
            .groupBy(["gambler.id", "gambler.name"]);
    });
