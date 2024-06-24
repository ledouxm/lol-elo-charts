import { InferModel, relations } from "drizzle-orm";
import {
    serial,
    text,
    timestamp,
    pgTable,
    pgEnum,
    varchar,
    boolean,
    integer,
    primaryKey,
    jsonb,
    date,
} from "drizzle-orm/pg-core";
import Galeforce from "galeforce";

export const divisionEnum = pgEnum("division", ["IV", "III", "II", "I", "NA"]);
export const tierEnum = pgEnum("tier", [
    "IRON",
    "BRONZE",
    "SILVER",
    "GOLD",
    "PLATINUM",
    "EMERALD",
    "DIAMOND",
    "MASTER",
    "GRANDMASTER",
    "CHALLENGER",
]);

export const summoner = pgTable(
    "summoner",
    {
        puuid: varchar("puuid", { length: 100 }),
        currentName: text("name"),
        id: varchar("id", { length: 100 }),
        icon: integer("icon"),
        isActive: boolean("is_active").default(true),
        checkedAt: timestamp("checked_at"),
        channelId: varchar("channel_id", { length: 100 }).notNull(),
        lastGameId: varchar("last_game_id", { length: 25 }),
        lastNotifiedInGameId: varchar("last_notified_in_game_id", { length: 25 }),
    },
    (table) => {
        return {
            pk: primaryKey(table.puuid, table.channelId),
        };
    }
);

export type Summoner = InferModel<typeof summoner, "select">;

export const summonerRelations = relations(summoner, ({ many }) => {
    return { ranks: many(rank), bets: many(bet), matches: many(match) };
});

export const rank = pgTable("rank", {
    id: serial("id").primaryKey(),
    summonerId: varchar("summoner_id", { length: 100 }).notNull(),
    tier: tierEnum("tier"),
    division: divisionEnum("division"),
    leaguePoints: integer("league_points"),
    createdAt: timestamp("created_at").defaultNow(),
});
export type InsertRank = InferModel<typeof rank, "insert">;
export type InsertRankWithoutLiterals = Omit<InsertRank, "division" | "tier"> & { tier: string; division: string };

export const rankRelations = relations(rank, ({ one }) => {
    return { summoner: one(summoner, { fields: [rank.summonerId], references: [summoner.puuid] }) };
});

export const apex = pgTable("apex", {
    id: serial("id").primaryKey(),
    master: integer("master"),
    grandmaster: integer("grandmaster"),
    challenger: integer("challenger"),
    createdAt: timestamp("created_at").defaultNow(),
});

export type Apex = InferModel<typeof apex, "select">;

export const gambler = pgTable("gambler", {
    id: serial("id").primaryKey(),
    discordId: varchar("discord_id", { length: 50 }),
    channelId: varchar("channel_id", { length: 100 }).notNull(),
    name: text("name"),
    avatar: varchar("avatar", { length: 40 }),
    createdAt: timestamp("created_at").defaultNow(),
    points: integer("points").default(500),
    lastClaim: timestamp("last_claim").defaultNow(),
    lastBeg: timestamp("last_beg"),
});

export type Gambler = InferModel<typeof gambler, "select">;

export const gamblerRelations = relations(gambler, ({ many }) => {
    return { bets: many(bet) };
});

export const bet = pgTable("bet", {
    id: serial("id").primaryKey(),
    gamblerId: integer("gambler_id").notNull(),
    summonerId: varchar("summoner_id", { length: 100 }),
    points: integer("points").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    endedAt: timestamp("ended_at"),
    matchId: varchar("match_id", { length: 25 }),
    hasBetOnWin: boolean("has_bet_on_win"),
    isWin: boolean("is_win"),
});

export type Bet = InferModel<typeof bet, "select">;

export const betRelations = relations(bet, ({ one }) => {
    return {
        gambler: one(gambler, { fields: [bet.gamblerId], references: [gambler.id] }),
        summoner: one(summoner, { fields: [bet.summonerId], references: [summoner.puuid] }),
    };
});

export const request = pgTable("request", {
    id: serial("id").primaryKey(),
    createdAt: timestamp("created_at").defaultNow(),
});

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

export const matchRelations = relations(match, ({ one }) => {
    return {
        summoner: one(summoner, { fields: [match.summonerId], references: [summoner.puuid] }),
    };
});

export const playerOfTheDayTypeEnum = pgEnum("player_of_the_day_type", ["winner", "loser"]);

export const playerOfTheDay = pgTable("player_of_the_day", {
    id: serial("id").primaryKey(),
    summonerId: varchar("summoner_id", { length: 100 }).notNull(),
    channelId: varchar("channel_id", { length: 100 }).notNull(),
    createdAt: date("created_at", { mode: "date" }).defaultNow(),
    type: playerOfTheDayTypeEnum("type"),
});

export const playerOfTheDayRelations = relations(playerOfTheDay, ({ one }) => {
    return { summoner: one(summoner, { fields: [playerOfTheDay.summonerId], references: [summoner.puuid] }) };
});
