import { HttpApiBuilder } from "@effect/platform";
import { Effect } from "effect";
import { AppApi } from "./api.ts";
import { AppDatabase } from "../../db/db.ts";
import { getDuoqMatchSummary, getSummonerPuuidFromDb, getSummonerPuuidFromDbWithFallback } from "../duoq.ts";
import { GetDuoQMatchesError, GetDuoQMatchSummaryError, GetSummonerError } from "./duoq.api.ts";
import { sql } from "kysely";

export const DuoQLive = HttpApiBuilder.group(AppApi, "duoq", (handlers) =>
    handlers
        .handle("duoq", ({ urlParams }) =>
            Effect.gen(function* () {
                const { summoner1, summoner2 } = urlParams;

                const [summonerData1, summonerData2] = yield* Effect.all(
                    [getSummonerPuuidFromDb(summoner1), getSummonerPuuidFromDbWithFallback(summoner2)],
                    { concurrency: "unbounded" }
                ).pipe(
                    Effect.catchTag("SqlError", () =>
                        Effect.fail(new GetSummonerError({ message: "DB error fetching summoner" }))
                    ),
                    Effect.catchTag("RequestError", () =>
                        Effect.fail(new GetSummonerError({ message: "Riot API error fetching summoner" }))
                    ),
                    Effect.catchTag("ResponseError", () =>
                        Effect.fail(new GetSummonerError({ message: "Riot API error fetching summoner" }))
                    )
                );

                const duoqSummary = yield* getDuoqMatchSummary(summonerData1.puuid, summonerData2.puuid).pipe(
                    Effect.catchTag("SqlError", () =>
                        Effect.fail(new GetDuoQMatchSummaryError({ message: "DB error fetching duoq summary" }))
                    )
                );

                return {
                    message: `Duoq endpoint for ${summonerData1.name} and ${summonerData2.name}`,
                    duoqSummary,
                    summoner1: summonerData1,
                    summoner2: summonerData2,
                };
            })
        )
        .handle("duoqMatches", ({ urlParams }) =>
            Effect.gen(function* () {
                const db = yield* AppDatabase;
                const { cursor, puuid1, puuid2 } = urlParams;

                const { matchIds } = yield* getDuoqMatchSummary(puuid1, puuid2).pipe(
                    Effect.catchTag("SqlError", () =>
                        Effect.fail(new GetDuoQMatchSummaryError({ message: "DB error fetching duoq summary" }))
                    )
                );

                if (!matchIds?.length) return { matchIds: [], matches: [], nextCursor: null };

                yield* Effect.log(`Total duoq matches found: ${matchIds}, ${!matchIds}`);
                const pageSize = 10;
                const startIndex = cursor ? matchIds.indexOf(cursor as string) : 0;
                const paginatedMatchIds = matchIds.slice(startIndex, startIndex + pageSize);
                const nextCursorIndex = startIndex + pageSize < matchIds.length ? startIndex + pageSize : null;

                const nextCursor = nextCursorIndex !== null ? matchIds[nextCursorIndex]! : null;

                yield* Effect.log({ startIndex, paginatedMatchIds, nextCursor, matchIdLength: matchIds.length });

                const matches = yield* db
                    .execute(
                        db
                            .selectFrom("match")
                            .select(["details"])
                            .where((eb) => eb("match_id", "in", paginatedMatchIds))
                            .orderBy("match_id", "desc")
                    )
                    .pipe(
                        Effect.catchTag("SqlError", () =>
                            Effect.fail(new GetDuoQMatchesError({ message: "DB error fetching matches" }))
                        )
                    );

                return {
                    matchIds: paginatedMatchIds,
                    matches: matches.map((m) => m.details),
                    nextCursor,
                };
            })
        )
        .handle("availableSummoners", ({ urlParams }) =>
            Effect.gen(function* () {
                const db = yield* AppDatabase;
                const { str } = urlParams;
                const query = db
                    .selectFrom("summoner")
                    .select(["puuid", "current_name as name", "icon"])
                    // .orderBy(asc(summoner.puuid), desc(summoner.lastGameEndedAt))
                    .orderBy("puuid", "asc")
                    .orderBy("last_game_ended_at", "desc")
                    .limit(10);

                if (str) {
                    query.where(sql<any>`current_name ILIKE ${"%" + str + "%"}`);
                }

                const summoners = yield* db
                    .execute(query)
                    .pipe(
                        Effect.catchTag(
                            "SqlError",
                            (e) =>
                                void console.error(e) ||
                                Effect.fail(
                                    new GetSummonerError({ message: `DB error fetching summoners, ${e.message}` })
                                )
                        )
                    );

                return summoners as Array<{ puuid: string; name: string; icon: number }>;
            })
        )
);
