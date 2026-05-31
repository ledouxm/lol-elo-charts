import { HttpApi, HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "@effect/platform";
import { Schema } from "effect";

const MinimalSummonerSchema = Schema.Struct({
    puuid: Schema.String,
    name: Schema.String,
    icon: Schema.Number,
});

const DuoQSummarySchema = Schema.Struct({
    message: Schema.String,
    duoqSummary: Schema.Struct({
        matchIds: Schema.Array(Schema.String),
        totalMatches: Schema.Number,
        wonTogether: Schema.Number,
        p1WonAgainstP2: Schema.Number,
        p2WonAgainstP1: Schema.Number,
        playedAgainst: Schema.Number,
        playedWith: Schema.Number,
    }),
    summoner1: MinimalSummonerSchema,
    summoner2: MinimalSummonerSchema,
});

const DuoqMatchesSchema = Schema.Struct({
    matchIds: Schema.Array(Schema.String),
    nextCursor: Schema.String,
    matches: Schema.Array(Schema.Any),
});

export class DuoQApi extends HttpApiGroup.make("duoq")
    .add(HttpApiEndpoint.get("duoq", "/").addSuccess(DuoQSummarySchema))
    .add(HttpApiEndpoint.get("duoqMatches", "/matches").addSuccess(DuoqMatchesSchema))
    .prefix("/duoq") {}
