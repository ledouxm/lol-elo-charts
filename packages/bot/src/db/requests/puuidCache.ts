import { Effect } from "effect";
import { sql } from "kysely";
import { PgDB } from "../index";

export const getSummonerByNormalizedName = (normalizedName: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db
            .selectFrom("summoner")
            .select(["puuid", "icon", "current_name"])
            .where(sql`LOWER(REPLACE(${sql.ref("current_name")}, ' ', '')) = ${normalizedName}`)
            .limit(1);
        return rows[0] ?? null;
    });

export const getCachedSummonerByNormalizedName = (normalizedName: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db
            .selectFrom("summonerPuuidCache")
            .select(["puuid", "icon", "name"])
            .where(sql`LOWER(REPLACE(${sql.ref("name")}, ' ', '')) = ${normalizedName}`)
            .limit(1);
        return rows[0] ?? null;
    });

export const insertCachedSummoner = (values: { puuid: string; name: string; icon: number }) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.insertInto("summonerPuuidCache").values(values);
    });

export const searchSummonersByName = (namePattern: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        return yield* db
            .selectFrom("summoner")
            .select(["puuid", "current_name", "icon"])
            .where("name", "ilike", `%${namePattern}%`)
            .orderBy("last_game_ended_at", "desc")

            .limit(10);
    });
