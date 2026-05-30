import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const summonerPuuidCache = pgTable("summoner_puuid_cache", {
    puuid: varchar("puuid", { length: 100 }).primaryKey(),
    name: text("name").notNull(),
    icon: integer("icon").notNull(),
    created_at: timestamp("created_at").defaultNow(),
});
