import { Effect } from "effect";
import { AppDatabase } from "../db.ts";

export const getGamblerByDiscordId = (discord_id: string, channel_id: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const rows = yield* db.execute(
            db
                .selectFrom("gambler")
                .selectAll()
                .where("discord_id", "=", discord_id)
                .where("channel_id", "=", channel_id)
                .limit(1)
        );
        return rows[0] ?? null;
    });

export const insertGambler = (values: { discord_id: string; channel_id: string; name: string; avatar: string }) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(db.insertInto("gambler").values(values));
    });

export const awardDailyPoints = (discord_id: string, channel_id: string, current_points: number) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(
            db
                .updateTable("gambler")
                .set({ points: current_points + 500, last_claim: new Date() })
                .where("discord_id", "=", discord_id)
                .where("channel_id", "=", channel_id)
        );
    });

export const deductPoints = (gambler_id: string, points: number) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(db.updateTable("gambler").set({ points }).where("id", "=", gambler_id));
    });

export const awardPayout = (gambler_id: string, points: number) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(db.updateTable("gambler").set({ points }).where("id", "=", gambler_id));
    });

export const setBegPoints = (gambler_id: string, points: number) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        yield* db.execute(db.updateTable("gambler").set({ points, last_beg: new Date() }).where("id", "=", gambler_id));
    });
