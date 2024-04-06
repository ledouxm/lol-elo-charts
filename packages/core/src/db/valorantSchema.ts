import { ValorantMatch } from "@/features/stalker/valorant/ValorantService";
import { InferModel } from "drizzle-orm";
import { boolean, integer, jsonb, pgTable, primaryKey, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const valorantPlayer = pgTable(
    "valorant_player",
    {
        puuid: varchar("puuid", { length: 100 }),
        currentName: text("name").notNull(),
        picture: text("picture"),
        card: text("card"),
        isActive: boolean("is_active").default(true),
        lastGameId: varchar("last_game_id", { length: 25 }),
        channelId: varchar("channel_id", { length: 100 }).notNull(),
    },
    (table) => {
        return {
            pk: primaryKey(table.puuid, table.channelId),
        };
    }
);
export const valorantRank = pgTable("valorant_rank", {
    id: serial("id").primaryKey(),
    playerId: varchar("player_id", { length: 100 }).notNull(),
    elo: integer("elo").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const valorantMatch = pgTable("valorant_match", {
    id: text("id").primaryKey(),
    details: jsonb("details").$type<ValorantMatch>(),
});

export type InsertValorantRank = InferModel<typeof valorantRank, "insert">;
export type ValorantPlayer = InferModel<typeof valorantPlayer, "select">;
