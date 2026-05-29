import { Effect } from "effect";
import { PgDB } from "../db";

export const getActiveValorantPlayers = (channelId?: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const query = db.selectFrom("valorantPlayer").selectAll().where("isActive", "=", true);
        return yield* channelId ? query.where("channelId", "=", channelId) : query;
    });

export const getValorantPlayerByPuuidAndChannel = (puuid: string, channelId: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db
            .selectFrom("valorantPlayer")
            .selectAll()
            .where("puuid", "=", puuid)
            .where("channelId", "=", channelId)
            .limit(1);
        return rows[0] ?? null;
    });

export const getValorantPlayerByName = (name: string, channelId: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db
            .selectFrom("valorantPlayer")
            .selectAll()
            .where("currentName", "=", name)
            .where("channelId", "=", channelId)
            .limit(1);
        return rows[0] ?? null;
    });

export const insertValorantPlayer = (values: {
    puuid: string;
    channelId: string;
    currentName: string;
    card: string;
    picture: string;
    isActive: boolean;
}) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.insertInto("valorantPlayer").values(values);
    });

export const reactivateValorantPlayer = (puuid: string, currentName: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.updateTable("valorantPlayer").set({ isActive: true, currentName }).where("puuid", "=", puuid);
    });

export const deactivateValorantPlayer = (name: string, channelId: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db
            .updateTable("valorantPlayer")
            .set({ isActive: false })
            .where("currentName", "=", name)
            .where("channelId", "=", channelId);
    });

export const updateValorantPlayerLastGame = (puuid: string, lastGameId: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.updateTable("valorantPlayer").set({ lastGameId }).where("puuid", "=", puuid);
    });

export const updateValorantPlayerName = (puuid: string, currentName: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.updateTable("valorantPlayer").set({ currentName }).where("puuid", "=", puuid);
    });

export const getLastValorantRank = (playerId: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db
            .selectFrom("valorantRank")
            .selectAll()
            .where("playerId", "=", playerId)
            .orderBy("createdAt", "desc")
            .limit(1);
        return rows[0] ?? null;
    });

export const insertValorantRank = (values: { playerId: string; elo: number }) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.insertInto("valorantRank").values(values);
    });

export const getValorantMatchById = (matchId: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db.selectFrom("valorantMatch").selectAll().where("id", "=", matchId).limit(1);
        return rows[0] ?? null;
    });

export const insertValorantMatch = (values: { id: string; details: unknown }) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.insertInto("valorantMatch").values(values);
    });
