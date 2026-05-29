import { sql } from "drizzle-orm";
import { date, pgEnum, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const playerOfTheDayTypeEnum = pgEnum("player_of_the_day_type", ["winner", "loser"]);

export const playerOfTheDay = pgTable("player_of_the_day", {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    summonerId: varchar("summoner_id", { length: 100 }).notNull(),
    channelId: varchar("channel_id", { length: 100 }).notNull(),
    createdAt: date("created_at", { mode: "date" }).defaultNow(),
    type: playerOfTheDayTypeEnum("type"),
});
