import * as arena from "./arena.ts";
import * as cache from "./cache.ts";
import * as gambling from "./gambling.ts";
import * as match from "./match.ts";
import * as playerOfTheDay from "./player-of-the-day.ts";
import * as rank from "./rank.ts";
import * as summoner from "./summoner.ts";
import * as valorant from "./valorant.ts";

export const schema = {
    ...arena,
    ...cache,
    ...gambling,
    ...match,
    ...playerOfTheDay,
    ...rank,
    ...summoner,
    ...valorant,
};

export type InsertRank = typeof schema.rank.$inferInsert;
