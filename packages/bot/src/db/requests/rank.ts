import { Effect } from "effect";
import { PgDB } from "../index";

export const getLastRankForSummoner = (puuid: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db
            .selectFrom("rank")
            .selectAll()
            .where("summonerId", "=", puuid)
            .orderBy("createdAt", "desc")
            .limit(1)
            ;
        return rows[0] ?? null;
    });

export const getLatestRankPerSummoner = (puuids: string[]) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        return yield* db
            .selectFrom("rank")
            .selectAll()
            .where("summonerId", "in", puuids)
            .orderBy("createdAt", "desc")
            ;
    });

export const getRankHistoryForSummoner = (puuid: string, from: Date, to: Date) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        return yield* db
            .selectFrom("rank")
            .selectAll()
            .where("summonerId", "=", puuid)
            .where("createdAt", ">=", from)
            .where("createdAt", "<=", to)
            .orderBy("createdAt", "asc")
            ;
    });

export const getStartOfDayRank = (puuid: string, dayStart: Date) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db
            .selectFrom("rank")
            .selectAll()
            .where("summonerId", "=", puuid)
            .where("createdAt", "<=", dayStart)
            .orderBy("createdAt", "desc")
            .limit(1)
            ;
        return rows[0] ?? null;
    });

export const insertRank = (values: {
    summonerId: string;
    tier: string;
    division: string;
    leaguePoints: number;
}) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.insertInto("rank").values(values);
    });
