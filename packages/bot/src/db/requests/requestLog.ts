import { Effect } from "effect";
import { sql } from "kysely";
import { PgDB } from "../db";

export const insertRequest = () =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.insertInto("request").values({ createdAt: new Date() });
    });

export const getRequestsPerMinute = (start: Date, end?: Date) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const query = db
            .selectFrom("request")
            .select([sql<number>`COUNT(*)`.as("count"), sql`DATE_TRUNC('minute', created_at)`.as("date")])
            .where("createdAt", ">=", start)
            .groupBy(sql`DATE_TRUNC('minute', created_at)`)
            .orderBy(sql`DATE_TRUNC('minute', created_at)`, "asc");
        return yield* end ? query.where("createdAt", "<=", end) : query;
    });

export const getRequestsPerSecond = (start: Date, end?: Date) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const query = db
            .selectFrom("request")
            .select([sql<number>`COUNT(*)`.as("count"), sql`DATE_TRUNC('second', created_at)`.as("date")])
            .where("createdAt", ">=", start)
            .groupBy(sql`DATE_TRUNC('second', created_at)`)
            .orderBy(sql`DATE_TRUNC('second', created_at)`, "asc");
        return yield* end ? query.where("createdAt", "<=", end) : query;
    });

export const clearRequests = () =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.deleteFrom("request");
    });
