import { Effect } from "effect";
import { PgDB } from "../db";

export const getActiveSummoners = (channelId?: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const query = db.selectFrom("summoner").selectAll().where("isActive", "=", true);
        return yield* channelId ? query.where("channelId", "=", channelId) : query;
    });

export const getSummonerByPuuidAndChannel = (puuid: string, channelId: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db
            .selectFrom("summoner")
            .selectAll()
            .where("puuid", "=", puuid)
            .where("channelId", "=", channelId)
            .limit(1);
        return rows[0] ?? null;
    });

export const getSummonerByName = (name: string, channelId: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db
            .selectFrom("summoner")
            .selectAll()
            .where("currentName", "=", name)
            .where("channelId", "=", channelId)
            .limit(1);
        return rows[0] ?? null;
    });

export const insertSummoner = (values: {
    puuid: string;
    id: string;
    channelId: string;
    icon: number;
    currentName: string;
}) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.insertInto("summoner").values(values);
    });

export const reactivateSummoner = (puuid: string, currentName: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.updateTable("summoner").set({ isActive: true, currentName }).where("puuid", "=", puuid);
    });

export const deactivateSummoner = (name: string, channelId: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db
            .updateTable("summoner")
            .set({ isActive: false })
            .where("currentName", "=", name)
            .where("channelId", "=", channelId);
    });

export const updateSummonerName = (puuid: string, currentName: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.updateTable("summoner").set({ currentName }).where("puuid", "=", puuid);
    });

export const updateSummonerLastGame = (puuid: string, lastGameId: string, lastGameEndedAt: Date) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.updateTable("summoner").set({ lastGameId, lastGameEndedAt }).where("puuid", "=", puuid);
    });
