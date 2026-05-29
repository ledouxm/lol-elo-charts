import { date, pgEnum, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const playerOfTheDayTypeEnum = pgEnum("player_of_the_day_type", ["winner", "loser"]);

export const playerOfTheDay = pgTable("player_of_the_day", {
    id: serial("id").primaryKey(),
    summonerId: varchar("summoner_id", { length: 100 }).notNull(),
    channelId: varchar("channel_id", { length: 100 }).notNull(),
    createdAt: date("created_at", { mode: "date" }).defaultNow(),
    type: playerOfTheDayTypeEnum("type"),
});
