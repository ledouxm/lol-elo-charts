import { Context, Layer, Redacted } from "effect";
import { Kyselify } from "drizzle-orm/kysely";
import * as lolSchema from "./schema";
import * as valorantSchema from "./valorantSchema";
import { PgTable } from "drizzle-orm/pg-core";
import * as PgKysely from "@effect/sql-kysely/Pg";
import * as Pg from "@effect/sql-pg";

type LolSchema = typeof lolSchema;
type ValorantSchema = typeof valorantSchema;

export type Database = {
    [Key in keyof typeof lolSchema]: LolSchema[Key] extends PgTable<any> ? Kyselify<LolSchema[Key]> : never;
} & {
    [Key in keyof typeof valorantSchema]: ValorantSchema[Key] extends PgTable<any>
        ? Kyselify<ValorantSchema[Key]>
        : never;
};

export class PgDB extends Context.Tag("PgDB")<PgDB, PgKysely.EffectKysely<Database>>() {}

const PgLive = Pg.PgClient.layer({
    url: Redacted.make(process.env.DATABASE_URL!),
});

export const KyselyLive = Layer.effect(PgDB, PgKysely.make<Database>()).pipe(Layer.provide(PgLive));
