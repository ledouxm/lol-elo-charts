import { Effect } from "effect";
import { AppLayer } from "./layers.js";

const program = Effect.gen(function* () {
    yield* Effect.logInfo("Bot starting...");
});

Effect.runPromise(program.pipe(Effect.provide(AppLayer))).catch(console.error);
