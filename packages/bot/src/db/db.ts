import { Context } from "effect";

import type { EffectKysely } from "./effect-kysely.ts";

import * as lolSchema from "./schema.ts";
import * as valorantSchema from "./valorant-schema.ts";
import type { Kyselify } from "drizzle-orm/kysely";
import { PgTable } from "drizzle-orm/pg-core";

type LolSchema = typeof lolSchema;
type ValorantSchema = typeof valorantSchema;

export type Database = {
    [Key in keyof typeof lolSchema]: LolSchema[Key] extends PgTable<any> ? Kyselify<LolSchema[Key]> : never;
} & {
    [Key in keyof typeof valorantSchema]: ValorantSchema[Key] extends PgTable<any>
        ? Kyselify<ValorantSchema[Key]>
        : never;
};

export class AppDatabase extends Context.Tag("AppDatabase")<AppDatabase, EffectKysely<Database>>() {}
