import { NodeContext } from "@effect/platform-node";
import type { Config as DrizzleConfig } from "drizzle-kit";
import { Effect, Redacted } from "effect";
import { AppConfig, AppConfigLayer } from "./src/app.config.ts";

import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

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

const drizzleConfig = Effect.runSync(getConfig.pipe(Effect.provide(AppConfigLayer), Effect.provide(NodeContext.layer)));

export default drizzleConfig;
