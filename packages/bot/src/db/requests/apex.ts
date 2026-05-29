import { Effect } from "effect";
import { AppDatabase } from "../db";

export const getLastApex = () =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const rows = yield* db.execute(db.selectFrom("apex").selectAll().orderBy("created_at", "desc").limit(1));
        return rows[0] ?? null;
    });

export const insertApex = (values: { master: number; grandmaster: number; challenger: number }) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(db.insertInto("apex").values(values));
    });
