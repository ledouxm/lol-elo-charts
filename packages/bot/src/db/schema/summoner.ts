import { type InferModel } from "drizzle-orm";
import { boolean, integer, pgTable, primaryKey, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const summoner = pgTable(
    "summoner",
    {
        puuid: varchar("puuid", { length: 100 }),
        currentName: text("current_name"),
        id: varchar("id", { length: 100 }),
        icon: integer("icon"),
        isActive: boolean("is_active").default(true),
        checkedAt: timestamp("checked_at"),
        channelId: varchar("channel_id", { length: 100 }).notNull(),
        lastGameId: varchar("last_game_id", { length: 25 }),
        lastNotifiedInGameId: varchar("last_notified_in_game_id", { length: 25 }),
        lastGameEndedAt: timestamp("last_game_ended_at"),
    },
    (table) => {
        return {
            pk: primaryKey(table.puuid, table.channelId),
        };
    }
);

export type Summoner = InferModel<typeof summoner, "select">;
