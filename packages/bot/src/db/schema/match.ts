import { sql } from "drizzle-orm";
import { boolean, integer, jsonb, pgTable, primaryKey, timestamp, varchar, text, bigint } from "drizzle-orm/pg-core";
import type { MatchV5DTOs } from "twisted/dist/models-dto/matches/match-v5/match.dto.d.ts";

export const match = pgTable("match", {
    id: text("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    match_id: varchar("match_id", { length: 25 }).notNull(),
    summoner_id: varchar("summoner_id", { length: 100 }).notNull(),
    created_at: timestamp("created_at").defaultNow(),
    participant_index: integer("participant_index"),
    started_at: timestamp("started_at"),
    ended_at: timestamp("ended_at"),
    is_win: boolean("is_win"),
    champion_name: text("champion_name"),
    kda: varchar("kda", { length: 20 }),
    details: jsonb("details").$type<MatchV5DTOs.InfoDto>(),
});

export const lolParticipant = pgTable(
    "lol_participant",
    {
        match_id: varchar("match_id", { length: 25 }).notNull(),
        puuid: varchar("puuid", { length: 100 }).notNull(),
        win: boolean("win").notNull(),
    },
    (table) => {
        return {
            pk: primaryKey(table.match_id, table.puuid),
        };
    }
);

export const game = pgTable("game", {
    game_id: bigint("game_id", { mode: "number" }).primaryKey(),
    game_creation: bigint("game_creation", { mode: "number" }).primaryKey(),
    game_duration: integer("game_duration").notNull(),
    game_end_timestamp: bigint("game_end_timestamp", { mode: "number" }).notNull(),
    game_mode: text("game_mode").notNull(),
    game_name: text("game_name").notNull(),
    end_of_game_result: text("end_of_game_result").notNull(),
    game_start_timestamp: bigint("game_start_timestamp", { mode: "number" }).notNull(),
    game_type: text("game_type").notNull(),
    game_version: text("game_version").notNull(),
    map_id: integer("map_id").notNull(),
    platform_id: text("platform_id").notNull(),
    queue_id: integer("queue_id").notNull(),
    teams: jsonb("teams").$type<Array<MatchV5DTOs.TeamDto>>(),
    participants: jsonb("participants").$type<Array<MatchV5DTOs.ParticipantDto>>(),
    tournament_code: text("tournament_code").notNull(),
});
