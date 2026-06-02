import { Context } from "effect";

import type { Kyselify } from "drizzle-orm/kysely";
import { PgTable } from "drizzle-orm/pg-core";
import { Effect, Layer, Redacted } from "effect";
import { schema } from "./schema/index.ts";

import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { AppConfig } from "../app.config.ts";
import { makeFromKysely, type EffectKysely } from "./effect-kysely.ts";

type Schema = typeof schema;

export type Database = {
    [Key in keyof Schema]: Schema[Key] extends PgTable<any> ? Kyselify<Schema[Key]> : never;
};

export class AppDatabase extends Context.Tag("AppDatabase")<AppDatabase, EffectKysely<Database>>() {}

const makeAppDatabaseLayer = (url: string) =>
    Layer.scoped(
        AppDatabase,
        Effect.gen(function* () {
            const client = new Pool({ connectionString: url });
            console.log("Connecting to database:", url);

            const qb = new Kysely<Database>({
                dialect: new PostgresDialect({ pool: client }),
            });

            yield* Effect.addFinalizer(() =>
                Effect.tryPromise(() => {
                    console.log("Destroying database");
                    return qb.destroy();
                }).pipe(Effect.catchAll(() => Effect.void))
            );

            return makeFromKysely(qb);
        })
    );

export const makeAppDatabaseLayerFromEnv = Layer.unwrapEffect(
    Effect.gen(function* () {
        const { db } = yield* AppConfig;
        const rawValue = Redacted.value(db.url);

        return makeAppDatabaseLayer(rawValue);
    })
);
