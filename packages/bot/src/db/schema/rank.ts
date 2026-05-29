import { type InferModel } from "drizzle-orm";
import { integer, pgEnum, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

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

export const rank = pgTable("rank", {
    id: serial("id").primaryKey(),
    summonerPuuid: varchar("summoner_puuid", { length: 100 }).notNull(),
    tier: tierEnum("tier"),
    division: divisionEnum("division"),
    leaguePoints: integer("league_points"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const apex = pgTable("apex", {
    id: serial("id").primaryKey(),
    master: integer("master"),
    grandmaster: integer("grandmaster"),
    challenger: integer("challenger"),
    createdAt: timestamp("created_at").defaultNow(),
});

export type InsertRank = InferModel<typeof rank, "insert">;
export type Apex = InferModel<typeof apex, "select">;
