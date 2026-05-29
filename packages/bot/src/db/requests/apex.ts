import { Effect } from "effect";
import { PgDB } from "../index";

export const getLastApex = () =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db.selectFrom("apex").selectAll().orderBy("createdAt", "desc").limit(1);
        return rows[0] ?? null;
    });

export const insertApex = (values: { master: number; grandmaster: number; challenger: number }) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.insertInto("apex").values(values);
    });
