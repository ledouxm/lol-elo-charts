import { InferModel, relations } from "drizzle-orm";
import { serial, text, timestamp, pgTable, pgEnum, varchar, boolean, integer } from "drizzle-orm/pg-core";

export const divisionEnum = pgEnum("division", ["IV", "III", "II", "I", "NA"]);
export const tierEnum = pgEnum("tier", [
    "IRON",
    "SILVER",
    "GOLD",
    "PLATINUM",
    "DIAMOND",
    "MASTER",
    "GRANDMASTER",
    "CHALLENGER",
]);

export const summoner = pgTable("summoner", {
    puuid: varchar("puuid", { length: 100 }).primaryKey(),
    currentName: text("name"),
    id: varchar("id", { length: 100 }),
    icon: integer("icon"),
    isActive: boolean("is_active").default(true),
    checkedAt: timestamp("checked_at"),
    channelId: varchar("channel_id", { length: 100 }).notNull(),
});

export const summonerRelations = relations(summoner, ({ many }) => {
    return { ranks: many(rank) };
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
