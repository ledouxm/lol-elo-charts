import { Effect } from "effect";
import { AppDatabase } from "../db.ts";
import type { MatchV5DTOs } from "twisted/dist/models-dto/matches/match-v5/match.dto.js";

export const getMatchByMatchId = (match_id: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const rows = yield* db.execute(db.selectFrom("match").selectAll().where("match_id", "=", match_id).limit(1));
        return rows[0] ?? null;
    });

export const getMatchByMatchIdAndSummoner = (match_id: string, summoner_id: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const rows = yield* db.execute(
            db
                .selectFrom("match")
                .selectAll()
                .where("match_id", "=", match_id)
                .where("summoner_id", "=", summoner_id)
                .limit(1)
        );
        return rows[0] ?? null;
    });

export const getMatchesByIds = (matchIds: string[]) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        return yield* db.execute(db.selectFrom("match").selectAll().where("match_id", "in", matchIds));
    });

export const getTodaysWinLoss = (summoner_id: string, dayStart: Date, dayEnd: Date) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        return yield* db.execute(
            db
                .selectFrom("match")
                .select(["is_win"])
                .where("summoner_id", "=", summoner_id)
                .where("ended_at", ">=", dayStart)
                .where("ended_at", "<=", dayEnd)
        );
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
    details: MatchV5DTOs.InfoDto;
}) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(db.insertInto("match").values(values));
    });
