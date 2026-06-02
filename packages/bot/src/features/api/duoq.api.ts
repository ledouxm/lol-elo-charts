import { HttpApi, HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "@effect/platform";
import { Schema } from "effect";
import { SummonerNotFound } from "../duoq.ts";

export class GetSummonerError extends Schema.TaggedError<GetSummonerError>()(
    "GetSummonerError",
    { message: Schema.String },
    HttpApiSchema.annotations({ status: 500 })
) {}

export class GetDuoQMatchSummaryError extends Schema.TaggedError<GetDuoQMatchSummaryError>()(
    "GetDuoQMatchSummaryError",
    { message: Schema.String },
    HttpApiSchema.annotations({ status: 500 })
) {}

export class GetDuoQMatchesError extends Schema.TaggedError<GetDuoQMatchesError>()(
    "GetDuoQMatchesError",
    { message: Schema.String },
    HttpApiSchema.annotations({ status: 500 })
) {}

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
    nextCursor: Schema.NullOr(Schema.String),
    matches: Schema.Array(Schema.Any),
});

export class DuoQApi extends HttpApiGroup.make("duoq")
    .add(
        HttpApiEndpoint.get("duoq", "/")
            .setUrlParams(
                Schema.Struct({
                    summoner1: Schema.String,
                    summoner2: Schema.String,
                })
            )
            .addError(SummonerNotFound)
            .addError(GetSummonerError)
            .addError(GetDuoQMatchSummaryError)
            .addSuccess(DuoQSummarySchema)
    )
    .add(
        HttpApiEndpoint.get("duoqMatches", "/matches")
            .setUrlParams(
                Schema.Struct({
                    cursor: Schema.UndefinedOr(Schema.String),
                    puuid1: Schema.String,
                    puuid2: Schema.String,
                })
            )
            .addError(GetDuoQMatchSummaryError)
            .addError(GetDuoQMatchesError)
            .addSuccess(DuoqMatchesSchema)
    )
    .prefix("/duoq") {}
