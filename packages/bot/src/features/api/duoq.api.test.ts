import { describe, expect, it } from "@effect/vitest";
import { HttpApiBuilder, HttpApiClient } from "@effect/platform";
import { NodeHttpServer } from "@effect/platform-node";
import { DummyDriver, Kysely, SqliteAdapter, SqliteIntrospector, SqliteQueryCompiler } from "kysely";
import { Effect, Layer, Option } from "effect";
import { AppApi } from "./api.ts";
import { DuoQLive } from "./duoq.live.ts";
import { AppDatabase } from "../../db/db.ts";
import { RiotClient } from "../riot-client.ts";
import type { EffectKysely } from "../../db/effect-kysely.ts";
import type { Database } from "../../db/db.ts";

// --- Mock helpers ---

type MockSummoner = { puuid: string; current_name: string; icon: number };
type MockSummonerCache = { puuid: string; name: string; icon: number };
type MockStats = { wonTogether: number; p1Won: number; p2Won: number; playedAgainst: number; playedWith: number };
type MockMatch = { details: unknown };

const makeMockDbLayer = ({
    summoners = [],
    summonerCache = [],
    matchIds = [],
    stats,
    matches = [],
}: {
    summoners?: MockSummoner[];
    summonerCache?: MockSummonerCache[];
    matchIds?: string[];
    stats?: MockStats;
    matches?: MockMatch[];
}) => {
    const summonersByName = Object.fromEntries(
        summoners.map((summoner) => [summoner.current_name.replaceAll(" ", "").toLowerCase(), summoner])
    );
    const cacheByName = Object.fromEntries(
        summonerCache.map((entry) => [entry.name.replaceAll(" ", "").toLowerCase(), entry])
    );

    const buildOnlyKysely = new Kysely<Database>({
        dialect: {
            createAdapter: () => new SqliteAdapter(),
            createDriver: () => new DummyDriver(),
            createIntrospector: (db) => new SqliteIntrospector(db),
            createQueryCompiler: () => new SqliteQueryCompiler(),
        },
    });

    const resolveQuery = (compiledSql: string, parameters: readonly unknown[]): unknown[] => {
        if (compiledSql.includes("insert into")) return [];
        if (
            compiledSql.includes('"summoner"') &&
            !compiledSql.includes('"summonerPuuidCache"') &&
            !compiledSql.includes('"lolParticipant"')
        ) {
            const summoner = summonersByName[parameters[0] as string];
            return summoner ? [summoner] : [];
        }
        if (compiledSql.includes('"summonerPuuidCache"')) {
            const cached = cacheByName[parameters[0] as string];
            return cached ? [cached] : [];
        }
        if (compiledSql.includes('"lolParticipant"') && compiledSql.includes("wonTogether")) {
            return stats ? [stats] : [];
        }
        if (compiledSql.includes('"lolParticipant"')) {
            return matchIds.map((matchId) => ({ match_id: matchId }));
        }
        if (compiledSql.includes('"match"')) {
            return matches;
        }
        return [];
    };

    const mockExecute = <O>(query: { compile: () => { sql: string; parameters: readonly unknown[] } }) => {
        const { sql: compiledSql, parameters } = query.compile();
        return Effect.succeed(resolveQuery(compiledSql, parameters) as O[]);
    };

    const mockDb = Object.assign(buildOnlyKysely, {
        execute: mockExecute,
        executeTakeFirstUnsafe: <O>(query: { compile: () => { sql: string; parameters: readonly unknown[] } }) =>
            mockExecute<O>(query).pipe(Effect.map((results) => results[0] as O)),
        executeTakeFirstOption: <O>(query: { compile: () => { sql: string; parameters: readonly unknown[] } }) =>
            mockExecute<O>(query).pipe(Effect.map((results) => Option.fromNullable(results[0]))),
        executeTakeFirstOrUndefined: <O>(query: { compile: () => { sql: string; parameters: readonly unknown[] } }) =>
            mockExecute<O>(query).pipe(Effect.map((results) => results[0] as O | undefined)),
    });

    return Layer.succeed(AppDatabase, mockDb as unknown as EffectKysely<Database>);
};

const noopRiotClientLayer = Layer.succeed(RiotClient, {
    get: () => Effect.die("unexpected RiotClient.get call"),
    post: () => Effect.die("unexpected RiotClient.post call"),
    put: () => Effect.die("unexpected RiotClient.put call"),
    fetch: () => Effect.die("unexpected RiotClient.fetch call"),
    httpClient: null,
    baseUrl: "",
} as any);

const makeTestLayer = (mockData: Parameters<typeof makeMockDbLayer>[0]) =>
    HttpApiBuilder.serve().pipe(
        Layer.provide(
            HttpApiBuilder.api(AppApi).pipe(
                Layer.provide(DuoQLive),
                Layer.provide(makeMockDbLayer(mockData)),
                Layer.provide(noopRiotClientLayer)
            )
        ),
        Layer.provideMerge(NodeHttpServer.layerTest)
    );

// --- Test data ---

const player1 = { puuid: "puuid-1", current_name: "TestPlayer1", icon: 1 };
const player2 = { puuid: "puuid-2", current_name: "TestPlayer2", icon: 2 };
const defaultStats = { wonTogether: 3, p1Won: 2, p2Won: 1, playedAgainst: 3, playedWith: 3 };
const defaultMatchIds = ["EUW_001", "EUW_002", "EUW_003"];

// --- Tests ---

describe("GET /duoq", () => {
    it.live("returns summary for two summoners found in DB", () =>
        Effect.gen(function* () {
            const client = yield* HttpApiClient.make(AppApi);
            const result = yield* client.duoq.duoq({
                urlParams: { summoner1: "TestPlayer1", summoner2: "TestPlayer2" },
            });
            expect(result.summoner1).toEqual({ puuid: player1.puuid, name: player1.current_name, icon: player1.icon });
            expect(result.summoner2).toEqual({ puuid: player2.puuid, name: player2.current_name, icon: player2.icon });
            expect(result.duoqSummary.totalMatches).toBe(3);
            expect(result.duoqSummary.wonTogether).toBe(3);
            expect(result.duoqSummary.p1WonAgainstP2).toBe(2);
        }).pipe(
            Effect.provide(
                makeTestLayer({ summoners: [player1, player2], stats: defaultStats, matchIds: defaultMatchIds })
            )
        )
    );

    it.live("returns summary with zero matches when no shared games", () =>
        Effect.gen(function* () {
            const client = yield* HttpApiClient.make(AppApi);
            const result = yield* client.duoq.duoq({
                urlParams: { summoner1: "TestPlayer1", summoner2: "TestPlayer2" },
            });
            expect(result.duoqSummary.totalMatches).toBe(0);
            expect(result.duoqSummary.wonTogether).toBe(0);
        }).pipe(
            Effect.provide(
                makeTestLayer({
                    summoners: [player1, player2],
                    stats: { wonTogether: 0, p1Won: 0, p2Won: 0, playedAgainst: 0, playedWith: 0 },
                })
            )
        )
    );
});

describe("GET /duoq/matches", () => {
    it.live("returns paginated matches", () =>
        Effect.gen(function* () {
            const client = yield* HttpApiClient.make(AppApi);
            const result = yield* client.duoq.duoqMatches({
                urlParams: { puuid1: "puuid-1", puuid2: "puuid-2", cursor: undefined },
            });
            expect(result.matchIds).toHaveLength(3);
            expect(result.matches).toHaveLength(3);
            expect(result.nextCursor).toBeNull();
        }).pipe(
            Effect.provide(
                makeTestLayer({
                    matchIds: defaultMatchIds,
                    stats: defaultStats,
                    matches: defaultMatchIds.map((matchId) => ({ details: { matchId } })),
                })
            )
        )
    );

    it.live("returns empty result when no shared matches", () =>
        Effect.gen(function* () {
            const client = yield* HttpApiClient.make(AppApi);
            const result = yield* client.duoq.duoqMatches({
                urlParams: { puuid1: "puuid-1", puuid2: "puuid-2", cursor: undefined },
            });
            expect(result.matchIds).toHaveLength(0);
            expect(result.matches).toHaveLength(0);
            expect(result.nextCursor).toBeNull();
        }).pipe(Effect.provide(makeTestLayer({ stats: defaultStats })))
    );

    it.live("paginates with cursor — first page has 10 items and a nextCursor", () => {
        const manyMatchIds = Array.from({ length: 15 }, (_, index) => `EUW_${String(index + 1).padStart(3, "0")}`);
        return Effect.gen(function* () {
            const client = yield* HttpApiClient.make(AppApi);
            const firstPage = yield* client.duoq.duoqMatches({
                urlParams: { puuid1: "puuid-1", puuid2: "puuid-2", cursor: undefined },
            });
            expect(firstPage.matchIds).toHaveLength(10);
            expect(firstPage.nextCursor).toBe("EUW_011");

            const secondPage = yield* client.duoq.duoqMatches({
                urlParams: { puuid1: "puuid-1", puuid2: "puuid-2", cursor: firstPage.nextCursor! },
            });
            expect(secondPage.matchIds).toHaveLength(5);
            expect(secondPage.nextCursor).toBeNull();
        }).pipe(Effect.provide(makeTestLayer({ matchIds: manyMatchIds, stats: defaultStats })));
    });
});
