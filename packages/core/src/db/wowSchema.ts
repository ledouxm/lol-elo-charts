import { InferModel } from "drizzle-orm";
import { decimal, integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const wowCharacter = pgTable("wow_character", {
    id: serial("id").primaryKey(),
    region: varchar("region", { length: 10 }),
    realm: varchar("realm", { length: 50 }),
    name: varchar("name", { length: 50 }),
    lastCrawledAt: varchar("last_crawled_at", { length: 50 }),
    class: varchar("class", { length: 50 }),
    spec: varchar("spec", { length: 50 }),
    thumbnailUrl: varchar("thumbnail_url", { length: 255 }),
    channelId: varchar("channel_id", { length: 50 }),
});

export type InsertWoWCharacter = InferModel<typeof wowCharacter, "insert">;
export type SelectWoWCharacter = InferModel<typeof wowCharacter, "select">;

export const wowMythicRun = pgTable("wow_mythic_run", {
    url: varchar("url", { length: 255 }).primaryKey(),
    characterId: integer("character_id").notNull(),
    dungeon: varchar("dungeon", { length: 100 }),
    shortName: varchar("short_name", { length: 100 }),
    mythicLevel: integer("mythic_level"),
    completedAt: timestamp("completed_at"),
    clearTimeMs: integer("clear_time_ms"),
    parTimeMs: integer("par_time_ms"),
    numKeystoneUpgrades: integer("num_keystone_upgrades"),
    mapChallengeModeId: integer("map_challenge_mode_id"),
    iconUrl: varchar("icon_url", { length: 255 }),
    backgroundImageUrl: varchar("background_image_url", { length: 255 }),
    score: decimal("score"),
    createdAt: timestamp("created_at").defaultNow(),
});

export type InsertWoWMythicRun = InferModel<typeof wowMythicRun, "insert">;
export type SelectWoWMythicRun = InferModel<typeof wowMythicRun, "select">;
