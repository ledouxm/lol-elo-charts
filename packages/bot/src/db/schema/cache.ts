import { type InferModel } from "drizzle-orm";
import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const summonerPuuidCache = pgTable("summoner_puuid_cache", {
    puuid: varchar("puuid", { length: 100 }).primaryKey(),
    name: text("name").notNull(),
    icon: integer("icon").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export type SummonerPuuidCache = InferModel<typeof summonerPuuidCache, "select">;
