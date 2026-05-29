import { Effect } from "effect";
import { AppDatabase } from "../db.ts";

export const getActiveValorantPlayers = (channelId?: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const query = db.selectFrom("valorantPlayer").selectAll().where("is_active", "=", true);
        return yield* db.execute(channelId ? query.where("channel_id", "=", channelId) : query);
    });

export const getValorantPlayerByPuuidAndChannel = (puuid: string, channelId: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const rows = yield* db.execute(
            db
                .selectFrom("valorantPlayer")
                .selectAll()
                .where("puuid", "=", puuid)
                .where("channel_id", "=", channelId)
                .limit(1)
        );
        return rows[0] ?? null;
    });

export const getValorantPlayerByName = (name: string, channelId: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const rows = yield* db.execute(
            db
                .selectFrom("valorantPlayer")
                .selectAll()
                .where("name", "=", name)
                .where("channel_id", "=", channelId)
                .limit(1)
        );
        return rows[0] ?? null;
    });

export const insertValorantPlayer = (values: {
    puuid: string;
    channel_id: string;
    name: string;
    card: string;
    picture: string;
    is_active: boolean;
}) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(db.insertInto("valorantPlayer").values(values));
    });

export const reactivateValorantPlayer = (puuid: string, name: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(
            db.updateTable("valorantPlayer").set({ is_active: true, name }).where("puuid", "=", puuid)
        );
    });

export const deactivateValorantPlayer = (name: string, channelId: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(
            db
                .updateTable("valorantPlayer")
                .set({ is_active: false })
                .where("name", "=", name)
                .where("channel_id", "=", channelId)
        );
    });

export const updateValorantPlayerLastGame = (puuid: string, last_game_id: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(db.updateTable("valorantPlayer").set({ last_game_id }).where("puuid", "=", puuid));
    });

export const updateValorantPlayerName = (puuid: string, name: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(db.updateTable("valorantPlayer").set({ name }).where("puuid", "=", puuid));
    });

export const getLastValorantRank = (playerId: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const rows = yield* db.execute(
            db
                .selectFrom("valorantRank")
                .selectAll()
                .where("player_id", "=", playerId)
                .orderBy("created_at", "desc")
                .limit(1)
        );
        return rows[0] ?? null;
    });

export const insertValorantRank = (values: { player_id: string; elo: number }) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(db.insertInto("valorantRank").values(values));
    });

export const getValorantMatchById = (matchId: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const rows = yield* db.execute(
            db.selectFrom("valorantMatch").selectAll().where("id", "=", matchId).limit(1)
        );
        return rows[0] ?? null;
    });

export const insertValorantMatch = (values: { id: string; details: unknown }) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(db.insertInto("valorantMatch").values(values));
    });
