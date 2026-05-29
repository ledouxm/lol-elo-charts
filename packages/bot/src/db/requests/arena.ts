import { Effect } from "effect";
import { PgDB } from "../db";

export const getArenaMatchById = (matchId: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db.selectFrom("arenaMatch").selectAll().where("match_id", "=", matchId).limit(1);
        return rows[0] ?? null;
    });

export const insertArenaMatch = (values: { matchId: string; endedAt: Date }) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.insertInto("arenaMatch").values(values);
    });

export const insertArenaPlayers = (
    values: Array<{ puuid: string; name: string; placement: number; champion: string; matchId: string }>
) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        return yield* db.insertInto("arenaPlayer").values(values).returningAll();
    });

export const getSummonersMatchingArenaPlayers = (puuids: string[]) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        return yield* db.selectFrom("summoner").selectAll().where("puuid", "in", puuids);
    });

export const getArenaWinsForSummoner = (puuid: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        return yield* db
            .selectFrom("arenaPlayer")
            .innerJoin("arenaMatch", "arenaMatch.match_id", "arenaPlayer.match_id")
            .selectAll()
            .where("arenaPlayer.puuid", "=", puuid)
            .where("arenaPlayer.placement", "=", 1);
    });

export const getArenaGamesCountForSummoner = (puuid: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db.selectFrom("arenaPlayer").selectAll().where("puuid", "=", puuid);
        return rows.length;
    });
