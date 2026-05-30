import { Effect } from "effect";
import { sql } from "kysely";
import { AppDatabase } from "../db.ts";

export const getSummonerByNormalizedName = (normalizedName: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const rows = yield* db.execute(
            db
                .selectFrom("summoner")
                .select(["puuid", "icon", "current_name"])
                .where(sql`LOWER(REPLACE(${sql.ref("current_name")}, ' ', '')) = ${normalizedName}`)
                .limit(1)
        );
        return rows[0] ?? null;
    });

export const getCachedSummonerByNormalizedName = (normalizedName: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const rows = yield* db.execute(
            db
                .selectFrom("summonerPuuidCache")
                .select(["puuid", "icon", "name"])
                .where(sql`LOWER(REPLACE(${sql.ref("name")}, ' ', '')) = ${normalizedName}`)
                .limit(1)
        );
        return rows[0] ?? null;
    });

export const insertCachedSummoner = (values: { puuid: string; name: string; icon: number }) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(db.insertInto("summonerPuuidCache").values(values));
    });

export const searchSummonersByName = (namePattern: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        return yield* db.execute(
            db
                .selectFrom("summoner")
                .select(["puuid", "current_name", "icon"])
                .where("current_name", "ilike", `%${namePattern}%`)
                .orderBy("last_game_ended_at", "desc")
                .limit(10)
        );
    });
