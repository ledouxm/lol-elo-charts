import { Effect } from "effect";
import { sql } from "kysely";
import { AppDatabase } from "../db.ts";

export const insertPlayerOfTheDay = (values: { summoner_id: string; channel_id: string; type: "winner" | "loser" }) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(db.insertInto("playerOfTheDay").values(values));
    });

export const getPlayerOfTheDayCount = (summoner_id: string, channel_id: string, type: "winner" | "loser") =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const rows = yield* db.execute(
            db
                .selectFrom("playerOfTheDay")
                .select(sql<number>`COUNT(*)`.as("count"))
                .where("summoner_id", "=", summoner_id)
                .where("channel_id", "=", channel_id)
                .where("type", "=", type)
        );
        return Number(rows[0]?.count ?? 0);
    });

export const getChannelPlayersOfTheDay = (channel_id: string, type: "winner" | "loser") =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        return yield* db.execute(
            db
                .selectFrom("playerOfTheDay")
                .selectAll()
                .where("channel_id", "=", channel_id)
                .where("type", "=", type)
                .orderBy("created_at", "desc")
        );
    });

export const getLastDateSummonerWasntPlayerOfTheDay = (
    summoner_id: string,
    channel_id: string,
    type: "winner" | "loser"
) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const rows = yield* db.execute(
            db
                .selectFrom("playerOfTheDay")
                .select(sql<Date>`MAX(created_at)`.as("lastDate"))
                .where("summoner_id", "!=", summoner_id)
                .where("channel_id", "=", channel_id)
                .where("type", "=", type)
        );
        return rows[0]?.lastDate ?? null;
    });

export const getStreakCount = (summonerId: string, channelId: string, type: "winner" | "loser", since: Date) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const rows = yield* db.execute(
            db
                .selectFrom("playerOfTheDay")
                .select(sql<number>`COUNT(*)`.as("count"))
                .where("summoner_id", "=", summonerId)
                .where("channel_id", "=", channelId)
                .where("type", "=", type)
                .where("created_at", ">", since)
        );
        return Number(rows[0]?.count ?? 0);
    });
