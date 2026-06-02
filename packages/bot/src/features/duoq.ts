import { Effect, Schema } from "effect";
import { AppDatabase } from "../db/db.ts";
import { RiotClient } from "./riot-client.ts";
import { sql } from "kysely";
import { HttpApiSchema } from "@effect/platform";

export const getSummonerPuuidFromDbWithFallback = (summonerName: string) =>
    Effect.gen(function* () {
        const riotClient = yield* RiotClient;
        const db = yield* AppDatabase;
        try {
            return yield* getSummonerPuuidFromDb(summonerName);
        } catch {
            const [name, tag] = summonerName.split("#") as [string, string];
            const accountFromRiot = yield* riotClient.get("/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}", {
                path: { gameName: name, tagLine: tag },
            });

            const summonerFromRiot = yield* riotClient.get("/lol/summoner/v4/summoners/by-puuid/{encryptedPUUID}", {
                path: { encryptedPUUID: accountFromRiot.puuid },
            });

            const fullname = `${accountFromRiot.gameName}#${accountFromRiot.tagLine}`;
            const payload = {
                puuid: accountFromRiot.puuid,
                name: fullname,
                icon: summonerFromRiot.profileIconId,
            };

            yield* db.execute(db.insertInto("summonerPuuidCache").values(payload));

            return payload;
        }
    });

export const getSummonerPuuidFromDb = (summonerName: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;
        const formatedName = summonerName.replaceAll(" ", "").toLowerCase();
        const summonerInDb = yield* db.executeTakeFirstUnsafe(
            db
                .selectFrom("summoner")
                .selectAll()
                .where((eb) => sql`LOWER(REPLACE(${eb.ref("current_name")}, ' ', '')) = ${formatedName}`)
                .limit(1)
        );

        if (summonerInDb)
            return {
                puuid: summonerInDb.puuid!,
                icon: summonerInDb.icon!,
                name: summonerInDb.current_name!,
            };

        const summonerInDbCache = yield* db.execute(
            db
                .selectFrom("summonerPuuidCache")
                .selectAll()
                .where((eb) => sql`LOWER(REPLACE(${eb.ref("name")}, ' ', '')) = ${formatedName}`)
                .limit(1)
        );

        if (summonerInDbCache.length > 0)
            return {
                puuid: summonerInDbCache[0]!.puuid,
                icon: summonerInDbCache[0]!.icon,
                name: summonerInDbCache[0]!.name,
            };

        throw new SummonerNotFound({ message: "Summoner not found in DB" });
    });

export const getDuoqMatchSummary = (puuid1: string, puuid2: string) =>
    Effect.gen(function* () {
        const db = yield* AppDatabase;

        const matches = yield* db.execute(
            db
                .selectFrom("lolParticipant as p1")
                .innerJoin("lolParticipant as p2", "p1.match_id", "p2.match_id")
                .select("p1.match_id")
                .where("p1.puuid", "=", puuid1)
                .where("p2.puuid", "=", puuid2)
                .orderBy("p1.match_id", "desc")
        );

        const stats = yield* db.executeTakeFirstUnsafe(
            db
                .selectFrom("lolParticipant as p1")
                .innerJoin("lolParticipant as p2", "p1.match_id", "p2.match_id")
                .select(sql<number>`COUNT(CASE WHEN p1.win = true AND p2.win = true THEN 1 END)::int`.as("wonTogether"))
                .select(sql<number>`COUNT(CASE WHEN p1.win = true AND p2.win = false THEN 1 END)::int`.as("p1Won"))
                .select(sql<number>`COUNT(CASE WHEN p2.win = true AND p1.win = false THEN 1 END)::int`.as("p2Won"))
                .select(sql<number>`COUNT(CASE WHEN p1.win != p2.win THEN 1 END)::int`.as("playedAgainst"))
                .select(sql<number>`COUNT(CASE WHEN p1.win = p2.win THEN 1 END)::int`.as("playedWith"))
                .where("p1.puuid", "=", puuid1)
                .where("p2.puuid", "=", puuid2)
        );

        return {
            totalMatches: matches.length,
            wonTogether: stats.wonTogether,
            p1WonAgainstP2: stats.p1Won,
            p2WonAgainstP1: stats.p2Won,
            playedAgainst: stats.playedAgainst,
            playedWith: stats.playedWith,
            matchIds: matches.map((match) => match.match_id),
        };
    });

export class SummonerNotFound extends Schema.TaggedError<SummonerNotFound>()(
    "SummonerNotFound",
    { message: Schema.String },
    HttpApiSchema.annotations({ status: 404 })
) {}
