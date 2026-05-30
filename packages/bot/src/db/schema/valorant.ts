import { type InferModel, sql } from "drizzle-orm";
import { boolean, integer, jsonb, pgTable, primaryKey, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const valorantPlayer = pgTable(
    "valorant_player",
    {
        puuid: varchar("puuid", { length: 100 }),
        name: text("name").notNull(),
        picture: text("picture"),
        card: text("card"),
        is_active: boolean("is_active").default(true),
        last_game_id: varchar("last_game_id", { length: 100 }),
        channel_id: varchar("channel_id", { length: 100 }).notNull(),
    },
    (table) => {
        return {
            pk: primaryKey(table.puuid, table.channel_id),
        };
    }
);
export const valorantRank = pgTable("valorant_rank", {
    id: text("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    player_id: varchar("player_id", { length: 100 }).notNull(),
    elo: integer("elo").notNull(),
    created_at: timestamp("created_at").defaultNow(),
});

export const valorantMatch = pgTable("valorant_match", {
    id: text("id").primaryKey(),
    details: jsonb("details").$type<any>(),
});
