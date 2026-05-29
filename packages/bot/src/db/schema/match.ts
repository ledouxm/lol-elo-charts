import { boolean, integer, jsonb, pgTable, primaryKey, serial, timestamp, varchar, text } from "drizzle-orm/pg-core";
import Galeforce from "galeforce";

export const match = pgTable("match", {
    id: serial("id").primaryKey(),
    matchId: varchar("match_id", { length: 25 }).notNull(),
    summonerId: varchar("summoner_id", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    participantIndex: integer("participant_index"),
    startedAt: timestamp("started_at"),
    endedAt: timestamp("ended_at"),
    isWin: boolean("is_win"),
    championName: text("champion_name"),
    kda: varchar("kda", { length: 20 }),
    details: jsonb("details").$type<Galeforce.dto.MatchDTO>(),
});

export const lolParticipant = pgTable(
    "lol_participant",
    {
        matchId: varchar("match_id", { length: 25 }).notNull(),
        puuid: varchar("puuid", { length: 100 }).notNull(),
        win: boolean("win").notNull(),
    },
    (table) => {
        return {
            pk: primaryKey(table.matchId, table.puuid),
        };
    }
);
