import { Effect } from "effect";
import { AppRuntime } from "./app.runtime.ts";
import { AppDatabase } from "./db/db.ts";

const program = Effect.gen(function* () {
    const db = yield* AppDatabase;
    const result = yield* db.execute(db.selectFrom("summoner").selectAll().limit(1));
    yield* Effect.logInfo("Bot starting...", result);
});

AppRuntime.runPromise(program);
process.on("SIGTERM", () => AppRuntime.dispose());
