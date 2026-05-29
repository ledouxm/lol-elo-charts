import { Effect, Layer, Redacted } from "effect";

import { AppDatabase, type Database } from "./db.ts";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { AppConfig } from "../app.config.ts";
import { makeFromKysely } from "./effect-kysely.ts";

const makeAppDatabaseLayer = (url: string) =>
    Layer.effect(
        AppDatabase,
        Effect.gen(function* () {
            const client = new Pool({ connectionString: url });
            console.log("Connecting to database:", url);

            const qb = new Kysely<Database>({
                dialect: new PostgresDialect({ pool: client }),
            });

            yield* Effect.addFinalizer(() =>
                Effect.tryPromise(() => {
                    // console.log("Destroying database");
                    return qb.destroy();
                }).pipe(Effect.catchAll(() => Effect.void))
            );

            return makeFromKysely(qb);
        }).pipe(Effect.scoped)
    );

export const makeAppDatabaseLayerFromEnv = Layer.unwrapEffect(
    Effect.gen(function* () {
        const { db } = yield* AppConfig;
        const rawValue = Redacted.value(db.url);

        return makeAppDatabaseLayer(rawValue);
    })
);
