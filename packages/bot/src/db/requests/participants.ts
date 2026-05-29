import { Effect } from "effect";
import { sql } from "kysely";
import { AppDatabase } from "../db.ts";

export const getParticipantsCount = () =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const rows = yield* db.execute(
            db.selectFrom("lolParticipant").select(sql<number>`COUNT(*)`.as("count"))
        );
        return Number(rows[0]?.count ?? 0);
    });

export const getMatchesWithDetailsCount = () =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const rows = yield* db.execute(
            db.selectFrom("match").select(sql<number>`COUNT(*)`.as("count")).where("details", "is not", null)
        );
        return Number(rows[0]?.count ?? 0);
    });

export const getMatchesPage = (offset: number, limit: number) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        return yield* db.execute(
            db
                .selectFrom("match")
                .select(["match_id", "details"])
                .where("details", "is not", null)
                .orderBy("created_at", "asc")
                .limit(limit)
                .offset(offset)
        );
    });

export const insertParticipants = (values: Array<{ match_id: string; puuid: string; win: boolean }>) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(db.insertInto("lolParticipant").values(values));
    });
