import { type InferModel, sql } from "drizzle-orm";
import { boolean, integer, numeric, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const gambler = pgTable("gambler", {
    id: text("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    discordId: varchar("discord_id", { length: 50 }),
    channelId: varchar("channel_id", { length: 100 }).notNull(),
    name: text("name"),
    avatar: varchar("avatar", { length: 40 }),
    createdAt: timestamp("created_at").defaultNow(),
    points: integer("points").default(500),
    lastClaim: timestamp("last_claim").defaultNow(),
    lastBeg: timestamp("last_beg"),
});

export const bet = pgTable("bet", {
    id: text("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    gamblerId: text("gambler_id").notNull(),
    summonerId: varchar("summoner_id", { length: 100 }),
    points: integer("points").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    endedAt: timestamp("ended_at"),
    matchId: varchar("match_id", { length: 25 }),
    hasBetOnWin: boolean("has_bet_on_win"),
    isWin: boolean("is_win"),
    odds: numeric("odds", { precision: 4, scale: 2 }),
});

export type Gambler = InferModel<typeof gambler, "select">;
export type Bet = InferModel<typeof bet, "select">;
