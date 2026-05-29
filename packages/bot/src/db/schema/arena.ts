import { type InferModel } from "drizzle-orm";
import { integer, pgTable, primaryKey, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const arenaMatch = pgTable("arena_match", {
    matchId: varchar("match_id", { length: 25 }).primaryKey(),
    endedAt: timestamp("ended_at"),
});

export const arenaPlayer = pgTable(
    "arena_player",
    {
        puuid: varchar("puuid", { length: 100 }),
        name: text("name"),
        placement: integer("placement"),
        champion: text("champion"),
        matchId: varchar("match_id", { length: 25 }).notNull(),
    },
    (table) => {
        return {
            pk: primaryKey(table.puuid, table.matchId),
        };
    }
);

export type ArenaPlayer = InferModel<typeof arenaPlayer, "select">;
