import { Effect } from "effect";
import { AppLayer } from "./app.layer";
import { AppRuntime } from "./app.runtime";

const program = Effect.gen(function* () {
    yield* Effect.logInfo("Bot starting...");
});

AppRuntime.runPromise(program);
process.on("SIGTERM", () => AppRuntime.dispose());
