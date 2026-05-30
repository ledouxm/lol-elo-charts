import { sql } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

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
    id: text("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    summonerPuuid: varchar("summoner_puuid", { length: 100 }).notNull(),
    tier: tierEnum("tier"),
    division: divisionEnum("division"),
    leaguePoints: integer("league_points"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const apex = pgTable("apex", {
    id: text("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    master: integer("master"),
    grandmaster: integer("grandmaster"),
    challenger: integer("challenger"),
    createdAt: timestamp("created_at").defaultNow(),
});
