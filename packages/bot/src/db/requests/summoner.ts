import { Effect } from "effect";
import { AppDatabase } from "../db.ts";

export const getActiveSummoners = (channelId?: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const query = db.selectFrom("summoner").selectAll().where("is_active", "=", true);
        return yield* db.execute(channelId ? query.where("channel_id", "=", channelId) : query);
    });

export const getSummonerByPuuidAndChannel = (puuid: string, channelId: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const rows = yield* db.execute(
            db
                .selectFrom("summoner")
                .selectAll()
                .where("puuid", "=", puuid)
                .where("channel_id", "=", channelId)
                .limit(1)
        );
        return rows[0] ?? null;
    });

export const getSummonerByName = (name: string, channelId: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const rows = yield* db.execute(
            db
                .selectFrom("summoner")
                .selectAll()
                .where("name", "=", name)
                .where("channel_id", "=", channelId)
                .limit(1)
        );
        return rows[0] ?? null;
    });

export const insertSummoner = (values: {
    puuid: string;
    id: string;
    channel_id: string;
    icon: number;
    name: string;
}) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(db.insertInto("summoner").values(values));
    });

export const reactivateSummoner = (puuid: string, name: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(db.updateTable("summoner").set({ is_active: true, name }).where("puuid", "=", puuid));
    });

export const deactivateSummoner = (name: string, channelId: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(
            db
                .updateTable("summoner")
                .set({ is_active: false })
                .where("name", "=", name)
                .where("channel_id", "=", channelId)
        );
    });

export const updateSummonerName = (puuid: string, name: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(db.updateTable("summoner").set({ name }).where("puuid", "=", puuid));
    });

export const updateSummonerLastGame = (puuid: string, last_game_id: string, last_game_ended_at: Date) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(
            db.updateTable("summoner").set({ last_game_id, last_game_ended_at }).where("puuid", "=", puuid)
        );
    });
