import { Effect } from "effect";
import { sql } from "kysely";
import { PgDB } from "../db";

export const insertPlayerOfTheDay = (values: { summonerId: string; channelId: string; type: "winner" | "loser" }) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.insertInto("playerOfTheDay").values(values);
    });

export const getPlayerOfTheDayCount = (summonerId: string, channelId: string, type: "winner" | "loser") =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db
            .selectFrom("playerOfTheDay")
            .select(sql<number>`COUNT(*)`.as("count"))
            .where("summoner_id", "=", summonerId)
            .where("channel_id", "=", channelId)
            .where("type", "=", type);
        return Number(rows[0]?.count ?? 0);
    });

export const getChannelPlayersOfTheDay = (channelId: string, type: "winner" | "loser") =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        return yield* db
            .selectFrom("playerOfTheDay")
            .selectAll()
            .where("channel_id", "=", channelId)
            .where("type", "=", type)
            .orderBy("created_at", "desc");
    });

export const getLastDateSummonerWasntPlayerOfTheDay = (
    summonerId: string,
    channelId: string,
    type: "winner" | "loser"
) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db
            .selectFrom("playerOfTheDay")
            .select(sql<Date>`MAX(created_at)`.as("lastDate"))
            .where("summoner_id", "!=", summonerId)
            .where("channel_id", "=", channelId)
            .where("type", "=", type);
        return rows[0]?.lastDate ?? null;
    });

export const getStreakCount = (summonerId: string, channelId: string, type: "winner" | "loser", since: Date) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db
            .selectFrom("playerOfTheDay")
            .select(sql<number>`COUNT(*)`.as("count"))
            .where("summoner_id", "=", summonerId)
            .where("channel_id", "=", channelId)
            .where("type", "=", type)
            .where("created_at", ">", since);
        return Number(rows[0]?.count ?? 0);
    });
