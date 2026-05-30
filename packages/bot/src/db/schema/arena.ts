import { integer, pgTable, primaryKey, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const arenaMatch = pgTable("arena_match", {
    match_id: varchar("match_id", { length: 25 }).primaryKey(),
    ended_at: timestamp("ended_at"),
});

export const arenaPlayer = pgTable(
    "arena_player",
    {
        puuid: varchar("puuid", { length: 100 }),
        name: text("name"),
        placement: integer("placement"),
        champion: text("champion"),
        match_id: varchar("match_id", { length: 25 }).notNull(),
    },
    (table) => {
        return {
            pk: primaryKey(table.puuid, table.match_id),
        };
    }
);
