import { Effect, Layer } from "effect";
import { AppRuntime } from "./app.runtime.ts";
import { AppDatabase } from "./db/db.ts";
import dotenv from "dotenv";
import { HttpServerLive } from "./features/api/api.live.ts";
dotenv.config({ path: "../../.env" });

const program = Effect.gen(function* () {
    const db = yield* AppDatabase;
    const result = yield* db.execute(db.selectFrom("summoner").selectAll().limit(1));
    yield* Effect.logInfo("Bot starting...", result);
});

AppRuntime.runFork(Layer.launch(HttpServerLive));
AppRuntime.runPromise(program);
process.on("SIGTERM", () => AppRuntime.dispose());
