import { Effect } from "effect";
import { PgDB } from "../db";

export const getGamblerByDiscordId = (discordId: string, channelId: string) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        const rows = yield* db
            .selectFrom("gambler")
            .selectAll()
            .where("discord_id", "=", discordId)
            .where("channel_id", "=", channelId)
            .limit(1);
        return rows[0] ?? null;
    });

export const insertGambler = (values: { discord_id: string; channel_id: string; name: string; avatar: string }) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.insertInto("gambler").values(values);
    });

export const awardDailyPoints = (discord_id: string, channel_id: string, currentPoints: number) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db
            .updateTable("gambler")
            .set({ points: currentPoints + 500, last_claim: new Date() })
            .where("discord_id", "=", discord_id)
            .where("channel_id", "=", channel_id);
    });

export const deductPoints = (gamblerId: number, newPoints: number) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.updateTable("gambler").set({ points: newPoints }).where("id", "=", gamblerId);
    });

export const awardPayout = (gamblerId: number, newPoints: number) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.updateTable("gambler").set({ points: newPoints }).where("id", "=", gamblerId);
    });

export const setBegPoints = (gamblerId: number, points: number) =>
    Effect.gen(function* () {
        const db = yield* PgDB;
        yield* db.updateTable("gambler").set({ points, last_beg: new Date() }).where("id", "=", gamblerId);
    });
