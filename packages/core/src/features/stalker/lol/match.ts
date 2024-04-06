import { db } from "@/db/db";
import { Summoner, match, summoner } from "@/db/schema";
import { getChampionIconUrl } from "@/features/lol/icons";
import Galeforce from "galeforce";
import { SummonerWithChannels } from "./summoner";
import { galeforce } from "@/features/summoner";
import { eq } from "drizzle-orm";

export const getMatchInformationsForSummoner = async (summ: Summoner, match: Galeforce.dto.MatchDTO) => {
    const participantIndex = match.info.participants.findIndex((p) => p.puuid === summ.puuid);
    const participant: Participant = match.info.participants[participantIndex];

    const championIconUrl = await getChampionIconUrl(participant.championName);
    const team = match.info.teams.find((t) => t.teamId === participant.teamId);

    return {
        participant,
        team,
        participantIndex,
        championIconUrl,
    } as {
        participant: Participant;
        team: Team;
        championIconUrl: string;
        participantIndex: number;
    };
};

export const getLastGameId = async (summoner: Summoner) => {
    const lastGames = await galeforce.lol.match
        .list()
        .region(galeforce.region.riot.EUROPE)
        .puuid(summoner.puuid)
        .query({ count: 1, queue: 420 })
        .exec();

    return lastGames?.[0];
};

export const getExistingGameById = async (gameId: string) => {
    const existingGames = await db.select().from(match).where(eq(match.matchId, gameId)).limit(1);

    return existingGames?.[0];
};

export const getGameById = async (gameId: string) => {
    const lastGame = await galeforce.lol.match.match().region(galeforce.region.riot.EUROPE).matchId(gameId).exec();

    return lastGame;
};

export const getLastGameAndStoreIfNecessary = async (summoner: Summoner) => {
    const lastGameId = await getLastGameId(summoner);
    if (!lastGameId) return null;

    const existingGame = await getExistingGameById(lastGameId);
    if (existingGame) return existingGame.details;

    const lastGame = await getGameById(lastGameId);
    await storeLoLMatch({ player: summoner, lastMatch: lastGame });

    return lastGame;
};

export const storeLoLMatch = async ({ player, lastMatch }: { player: Summoner; lastMatch: Galeforce.dto.MatchDTO }) => {
    const participantIndex = lastMatch.info.participants.findIndex((p) => p.puuid === player.puuid);
    const participant: Participant = lastMatch.info.participants[participantIndex];

    const isWin = participant.win;
    const kda = `${participant.kills}/${participant.deaths}/${participant.assists}`;

    return db.insert(match).values({
        startedAt: new Date(lastMatch.info.gameStartTimestamp),
        matchId: lastMatch.metadata.matchId,
        endedAt: new Date(lastMatch.info.gameEndTimestamp),
        isWin,
        kda,
        participantIndex,
        championName: participant.championName,
        summonerId: player.puuid,
        details: lastMatch,
    });
};

export const persistLastGameId = async (player: Summoner, gameId: string) => {
    await db.update(summoner).set({ lastGameId: gameId }).where(eq(summoner.puuid, player.puuid));
};

export type Participant = Galeforce.dto.MatchDTO["info"]["participants"][0];
export type Team = Galeforce.dto.MatchDTO["info"]["teams"][0];
