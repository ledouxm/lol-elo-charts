import { Effect, Layer } from "effect";

const program = Effect.gen(function* () {
    yield* Effect.logInfo("Bot starting...");
});

const AppLayer = Layer.empty;

Effect.runPromise(program.pipe(Effect.provide(AppLayer))).catch(console.error);
