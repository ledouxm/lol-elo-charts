import { sql } from "drizzle-orm";
import { boolean, integer, jsonb, pgTable, primaryKey, timestamp, varchar, text, bigint } from "drizzle-orm/pg-core";
import type { MatchV5DTOs } from "twisted/dist/models-dto/matches/match-v5/match.dto.d.ts";

export const match = pgTable("match", {
    id: text("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    matchId: varchar("match_id", { length: 25 }).notNull(),
    summonerId: varchar("summoner_id", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    participantIndex: integer("participant_index"),
    startedAt: timestamp("started_at"),
    endedAt: timestamp("ended_at"),
    isWin: boolean("is_win"),
    championName: text("champion_name"),
    kda: varchar("kda", { length: 20 }),
    details: jsonb("details").$type<MatchV5DTOs.InfoDto>(),
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

export const game = pgTable("game", {
    gameId: bigint("game_id", { mode: "number" }).primaryKey(),
    gameCreation: bigint("game_creation", { mode: "number" }).primaryKey(),
    gameDuration: integer("game_duration").notNull(),
    gameEndTimestamp: bigint("game_end_timestamp", { mode: "number" }).notNull(),
    gameMode: text("game_mode").notNull(),
    gameName: text("game_name").notNull(),
    endOfGameResult: text("end_of_game_result").notNull(),
    gameStartTimestamp: bigint("game_start_timestamp", { mode: "number" }).notNull(),
    gameType: text("game_type").notNull(),
    gameVersion: text("game_version").notNull(),
    mapId: integer("map_id").notNull(),
    platformId: text("platform_id").notNull(),
    queueId: integer("queue_id").notNull(),
    teams: jsonb("teams").$type<Array<MatchV5DTOs.TeamDto>>(),
    participants: jsonb("participants").$type<Array<MatchV5DTOs.ParticipantDto>>(),
    tournamentCode: text("tournament_code").notNull(),
});
