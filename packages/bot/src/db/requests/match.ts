import { Effect } from "effect";
import { PgDB } from "../db";

export const getMatchByMatchId = (matchId: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db.selectFrom("match").selectAll().where("match_id", "=", matchId).limit(1);
        return rows[0] ?? null;
    });

export const getMatchByMatchIdAndSummoner = (matchId: string, summonerId: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db
            .selectFrom("match")
            .selectAll()
            .where("match_id", "=", matchId)
            .where("summoner_id", "=", summonerId)
            .limit(1);
        return rows[0] ?? null;
    });

export const getMatchesByIds = (matchIds: string[]) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        return yield* db.selectFrom("match").selectAll().where("match_id", "in", matchIds);
    });

export const getTodaysWinLoss = (summonerId: string, dayStart: Date, dayEnd: Date) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        return yield* db
            .selectFrom("match")
            .select(["is_win"])
            .where("summoner_id", "=", summonerId)
            .where("ended_at", ">=", dayStart)
            .where("ended_at", "<=", dayEnd);
    });

export const insertMatch = (values: {
    match_id: string;
    summoner_id: string;
    started_at: Date;
    ended_at: Date;
    is_win: boolean;
    kda: string;
    participant_index: number;
    champion_name: string;
    details: unknown;
}) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.insertInto("match").values(values);
    });
