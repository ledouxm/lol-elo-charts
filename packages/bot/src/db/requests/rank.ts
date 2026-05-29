import { Effect } from "effect";
import { AppDatabase } from "../db.ts";
import type { InsertRankWithoutLiterals } from "../schema/index.ts";

export const getLastRankForSummoner = (puuid: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const rows = yield* db.execute(
            db.selectFrom("rank").selectAll().where("summoner_id", "=", puuid).orderBy("created_at", "desc").limit(1)
        );
        return rows[0] ?? null;
    });

export const getLatestRankPerSummoner = (puuids: string[]) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        return yield* db.execute(
            db.selectFrom("rank").selectAll().where("summoner_id", "in", puuids).orderBy("created_at", "desc")
        );
    });

export const getRankHistoryForSummoner = (puuid: string, from: Date, to: Date) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        return yield* db.execute(
            db
                .selectFrom("rank")
                .selectAll()
                .where("summoner_id", "=", puuid)
                .where("created_at", ">=", from)
                .where("created_at", "<=", to)
                .orderBy("created_at", "asc")
        );
    });

export const getStartOfDayRank = (puuid: string, dayStart: Date) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const rows = yield* db.execute(
            db
                .selectFrom("rank")
                .selectAll()
                .where("summoner_id", "=", puuid)
                .where("created_at", "<=", dayStart)
                .orderBy("created_at", "desc")
                .limit(1)
        );
        return rows[0] ?? null;
    });

export const insertRank = (values: Omit<InsertRankWithoutLiterals, "id" | "createdAt">) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(
            db.insertInto("rank").values(values as Parameters<ReturnType<typeof db.insertInto<"rank">>["values"]>[0])
        );
    });
