import type { Config as DrizzleConfig } from "drizzle-kit";

import { Effect, Redacted } from "effect";

import { AppConfig } from "#/app.config.ts";
import { ConfigWithDefaultEnvLayer } from "#/app.runtime.ts";

const getConfig = Effect.gen(function* () {
    const { db } = yield* AppConfig;

    const base = {
        dialect: "postgresql",
        schema: ["./src/db/schema/*.ts"],
        out: "./drizzle",
        verbose: true,
        dbCredentials: {
            url: Redacted.value(db.url),
        },
    } satisfies DrizzleConfig;

    return base;
});

export default Effect.runPromise(getConfig.pipe(Effect.provide(ConfigWithDefaultEnvLayer)));
