import { Effect } from "effect";
import { sql } from "kysely";
import { AppDatabase } from "../db.ts";

export const insertRequest = () =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(db.insertInto("request").values({ created_at: new Date() }));
    });

export const getRequestsPerMinute = (start: Date, end?: Date) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const query = db
            .selectFrom("request")
            .select([sql<number>`COUNT(*)`.as("count"), sql`DATE_TRUNC('minute', created_at)`.as("date")])
            .where("created_at", ">=", start)
            .groupBy(sql`DATE_TRUNC('minute', created_at)`)
            .orderBy(sql`DATE_TRUNC('minute', created_at)`, "asc");
        return yield* db.execute(end ? query.where("created_at", "<=", end) : query);
    });

export const getRequestsPerSecond = (start: Date, end?: Date) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const query = db
            .selectFrom("request")
            .select([sql<number>`COUNT(*)`.as("count"), sql`DATE_TRUNC('second', created_at)`.as("date")])
            .where("created_at", ">=", start)
            .groupBy(sql`DATE_TRUNC('second', created_at)`)
            .orderBy(sql`DATE_TRUNC('second', created_at)`, "asc");
        return yield* db.execute(end ? query.where("created_at", "<=", end) : query);
    });

export const clearRequests = () =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(db.deleteFrom("request"));
    });
