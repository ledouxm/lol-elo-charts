import { Context } from "effect";

import type { EffectKysely } from "./effect-kysely.ts";

import { schema } from "./schema/index.ts";
import type { Kyselify } from "drizzle-orm/kysely";
import { PgTable } from "drizzle-orm/pg-core";

type Schema = typeof schema;

export type Database = {
    [Key in keyof Schema]: Schema[Key] extends PgTable<any> ? Kyselify<Schema[Key]> : never;
};

export class AppDatabase extends Context.Tag("AppDatabase")<AppDatabase, EffectKysely<Database>>() {}
