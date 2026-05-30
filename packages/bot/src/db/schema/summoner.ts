import { boolean, integer, pgTable, primaryKey, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const summoner = pgTable(
    "summoner",
    {
        puuid: varchar("puuid", { length: 100 }),
        current_name: text("current_name"),
        id: varchar("id", { length: 100 }),
        icon: integer("icon"),
        is_active: boolean("is_active").default(true),
        checked_at: timestamp("checked_at"),
        channel_id: varchar("channel_id", { length: 100 }).notNull(),
        last_game_id: varchar("last_game_id", { length: 25 }),
        last_notified_in_game_id: varchar("last_notified_in_game_id", { length: 25 }),
        last_game_ended_at: timestamp("last_game_ended_at"),
    },
    (table) => {
        return {
            pk: primaryKey(table.puuid, table.channel_id),
        };
    }
);
