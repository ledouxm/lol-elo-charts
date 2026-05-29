import { relations } from "drizzle-orm";
import { arenaMatch, arenaPlayer } from "./arena.ts";
import { bet, gambler } from "./gambling.ts";
import { match } from "./match.ts";
import { playerOfTheDay } from "./player-of-the-day.ts";
import { rank } from "./rank.ts";
import { summoner } from "./summoner.ts";

export const rankRelations = relations(rank, ({ one }) => ({
    summoner: one(summoner, { fields: [rank.summonerId], references: [summoner.puuid] }),
}));

export const gamblerRelations = relations(gambler, ({ many }) => ({
    bets: many(bet),
}));

export const betRelations = relations(bet, ({ one }) => ({
    gambler: one(gambler, { fields: [bet.gamblerId], references: [gambler.id] }),
    summoner: one(summoner, { fields: [bet.summonerId], references: [summoner.puuid] }),
}));

export const matchRelations = relations(match, ({ one }) => ({
    summoner: one(summoner, { fields: [match.summonerId], references: [summoner.puuid] }),
}));

export const playerOfTheDayRelations = relations(playerOfTheDay, ({ one }) => ({
    summoner: one(summoner, { fields: [playerOfTheDay.summonerId], references: [summoner.puuid] }),
}));

export const arenaMatchRelations = relations(arenaMatch, ({ many }) => ({
    players: many(arenaPlayer),
}));

export const arenaPlayerRelations = relations(arenaPlayer, ({ one }) => ({
    match: one(arenaMatch, { fields: [arenaPlayer.matchId], references: [arenaMatch.matchId] }),
}));

export const summonerRelations = relations(summoner, ({ many }) => ({
    ranks: many(rank),
    bets: many(bet),
    matches: many(match),
    arenaPlayers: many(arenaPlayer),
}));
