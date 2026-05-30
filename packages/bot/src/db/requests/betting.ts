import { Effect } from "effect";
import { sql } from "kysely";
import { AppDatabase } from "../db.ts";

export const getActiveBets = () =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        return yield* db.execute(
            db
                .selectFrom("bet")
                .innerJoin("gambler", "gambler.id", "bet.gambler_id")
                .innerJoin("summoner", "summoner.puuid", "bet.summoner_id")
                .selectAll()
                .where("bet.ended_at", "is", null)
        );
    });

export const getActiveBetsByGambler = (gambler_id: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        return yield* db.execute(
            db.selectFrom("bet").selectAll().where("gambler_id", "=", gambler_id).where("ended_at", "is", null)
        );
    });

export const getActiveBetForGamblerAndSummoner = (gambler_id: string, summoner_id: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const rows = yield* db.execute(
            db
                .selectFrom("bet")
                .selectAll()
                .where("gambler_id", "=", gambler_id)
                .where("summoner_id", "=", summoner_id)
                .where("ended_at", "is", null)
                .limit(1)
        );
        return rows[0] ?? null;
    });

export const getActiveBetsByChannel = (channel_id: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        return yield* db.execute(
            db
                .selectFrom("bet")
                .innerJoin("summoner", "summoner.puuid", "bet.summoner_id")
                .innerJoin("gambler", "gambler.id", "bet.gambler_id")
                .selectAll()
                .where("summoner.channel_id", "=", channel_id)
                .where("bet.ended_at", "is", null)
        );
    });

export const getMyActiveBets = (discord_id: string, channel_id: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        return yield* db.execute(
            db
                .selectFrom("bet")
                .innerJoin("summoner", "summoner.puuid", "bet.summoner_id")
                .innerJoin("gambler", "gambler.id", "bet.gambler_id")
                .selectAll()
                .where("gambler.discord_id", "=", discord_id)
                .where("gambler.channel_id", "=", channel_id)
                .where("bet.ended_at", "is", null)
        );
    });

export const insertBet = (values: {
    gambler_id: string;
    summoner_id: string;
    points: number;
    has_bet_on_win: boolean;
    odds: string;
}) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(db.insertInto("bet").values(values));
    });

export const resolveBet = (bet_id: string, is_win: boolean, match_id: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(
            db
                .updateTable("bet")
                .set({ ended_at: new Date(), is_win: is_win, match_id: match_id })
                .where("id", "=", bet_id)
        );
    });

export const getBetWithRelations = (bet_id: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const rows = yield* db.execute(
            db
                .selectFrom("bet")
                .innerJoin("gambler", "gambler.id", "bet.gambler_id")
                .innerJoin("summoner", "summoner.puuid", "bet.summoner_id")
                .selectAll()
                .where("bet.id", "=", bet_id)
                .limit(1)
        );
        return rows[0] ?? null;
    });

export const getLeaderboard = (channel_id: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        return yield* db.execute(
            db
                .selectFrom("gambler")
                .leftJoin("bet", "bet.gambler_id", "gambler.id")
                .select([
                    "gambler.id",
                    "gambler.name",
                    "gambler.points",
                    sql<number>`SUM(CASE WHEN bet.is_win = TRUE THEN 1 ELSE 0 END)`.as("wins"),
                    sql<number>`SUM(CASE WHEN bet.is_win = FALSE THEN 1 ELSE 0 END)`.as("losses"),
                ])
                .where("gambler.channel_id", "=", channel_id)
                .groupBy(["gambler.id", "gambler.name", "gambler.points"])
                .orderBy("gambler.points", "desc")
        );
    });

export const getBetsRecapByChannel = (channel_id: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        return yield* db.execute(
            db
                .selectFrom("bet")
                .innerJoin("gambler", "gambler.id", "bet.gambler_id")
                .select([
                    "gambler.id",
                    "gambler.name",
                    sql<number>`SUM(CASE WHEN bet.is_win = TRUE THEN 1 ELSE 0 END)`.as("wins"),
                    sql<number>`SUM(CASE WHEN bet.is_win = FALSE THEN 1 ELSE 0 END)`.as("losses"),
                ])
                .where("gambler.channel_id", "=", channel_id)
                .groupBy(["gambler.id", "gambler.name"])
        );
    });
