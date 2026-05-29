import { Effect } from "effect";
import { sql } from "kysely";
import { PgDB } from "../index";

export const getParticipantsCount = () =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db.selectFrom("lolParticipant").select(sql<number>`COUNT(*)`.as("count"));
        return Number(rows[0]?.count ?? 0);
    });

export const getMatchesWithDetailsCount = () =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db
            .selectFrom("match")
            .select(sql<number>`COUNT(*)`.as("count"))
            .where("details", "is not", null);
        return Number(rows[0]?.count ?? 0);
    });

export const getMatchesPage = (offset: number, limit: number) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        return yield* db
            .selectFrom("match")
            .select(["match_id", "details"])
            .where("details", "is not", null)
            .orderBy("created_at", "asc")
            .limit(limit)
            .offset(offset);
    });

export const insertParticipants = (values: Array<{ match_id: string; puuid: string; win: boolean }>) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.insertInto("lolParticipant").values(values);
    });
