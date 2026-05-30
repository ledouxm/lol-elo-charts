import { sql } from "drizzle-orm";
import { boolean, integer, numeric, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const gambler = pgTable("gambler", {
    id: text("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    discord_id: varchar("discord_id", { length: 50 }),
    channel_id: varchar("channel_id", { length: 100 }).notNull(),
    name: text("name"),
    avatar: varchar("avatar", { length: 40 }),
    created_at: timestamp("created_at").defaultNow(),
    points: integer("points").default(500),
    last_claim: timestamp("last_claim").defaultNow(),
    last_beg: timestamp("last_beg"),
});

export const bet = pgTable("bet", {
    id: text("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    gambler_id: text("gambler_id").notNull(),
    summoner_id: varchar("summoner_id", { length: 100 }),
    points: integer("points").notNull(),
    created_at: timestamp("created_at").defaultNow(),
    ended_at: timestamp("ended_at"),
    match_id: varchar("match_id", { length: 25 }),
    has_bet_on_win: boolean("has_bet_on_win"),
    is_win: boolean("is_win"),
    odds: numeric("odds", { precision: 4, scale: 2 }),
});
