import { InferModel, and, eq, isNull } from "drizzle-orm";
import Galeforce from "galeforce";
import { db } from "../db/db";
import { Bet, Gambler, Summoner, bet, gambler, match, summoner } from "../db/schema";
import { addRequest, galeforce } from "./summoner";
import { subMinutes } from "date-fns";
import { Participant } from "./stalker/lol/match";
import { ENV } from "@/envVars";
import { getLoLNewRank } from "./stalker/lol/rank";

export const checkBetsAndGetLastGame = async () => {
    const bets = await db
        .select()
        .from(bet)
        .where(isNull(bet.endedAt))
        .leftJoin(gambler, eq(bet.gamblerId, gambler.id))
        .leftJoin(summoner, and(eq(bet.summonerId, summoner.puuid), eq(summoner.channelId, gambler.channelId)));

    if (!bets?.[0]) {
        void console.log("no bets");
        return [] as AchievedBet[];
    }
    console.log("Checking", bets.length, "bets");

    const newBets = [] as AchievedBet[];

    const gameCache: GameCache = new Map();

    for (const activeBet of bets) {
        try {
            const newBet = await tryToResolveBet({ activeBet, gameCache });
            if (newBet) newBets.push(newBet);
        } catch (e) {
            console.log(e);
        }
    }

    console.log("resolved", newBets.length, "bets");

    return newBets;
};

type GameCache = Map<string, Galeforce.dto.MatchDTO>;

export const calculateOddsFromStats = async (summonerPuuid: string) => {
    const statsFromSummoner = await getLoLNewRank(summonerPuuid);

    // If no stats available, return default odds
    if (!statsFromSummoner || statsFromSummoner.wins + statsFromSummoner.losses === 0) {
        return 1.9;
    }

    const totalGames = statsFromSummoner.wins + statsFromSummoner.losses;
    const winRate = statsFromSummoner.wins / totalGames;

    console.log(
        `Summoner stats - Wins: ${statsFromSummoner.wins}, Losses: ${statsFromSummoner.losses}, Win Rate: ${(
            winRate * 100
        ).toFixed(2)}%`
    );

    let odds = 1 / winRate;

    // prevents odds from being less than 1.2 and more than 5
    odds = Math.max(1.2, Math.min(odds, 5.0));

    odds = odds * 0.95;

    odds = Math.round(odds * 100) / 100;

    return odds;
};

const tryToResolveBet = async ({
    activeBet,
    gameCache,
}: {
    activeBet: { bet: InferModel<typeof bet, "select">; gambler: Gambler; summoner: Summoner };
    gameCache?: GameCache;
}) => {
    console.log("activeBet", activeBet);
    console.log(
        "resolving bet",
        activeBet.bet.id,
        "for",
        activeBet.summoner?.currentName,
        "on win",
        activeBet.bet.hasBetOnWin,
        "by",
        activeBet.gambler.name
    );

    const game = await getGameMatchingBet(activeBet, gameCache);
    if (!game) return;

    console.log("game", game.metadata.matchId, "found");

    await insertMatchFromMatchDto(game, activeBet.summoner.puuid);

    const isWin =
        game.info.participants.find((p) => p.puuid === activeBet.summoner.puuid)?.win === activeBet.bet.hasBetOnWin;

    console.log("bet is win", isWin);

    if (isWin) {
        const odds = Number(activeBet.bet.odds);

        //calculate payout
        const payout = Math.round(activeBet.bet.points * odds);

        // increase points if win with payout
        await db
            .update(gambler)
            .set({ points: activeBet.gambler.points + payout })
            .where(eq(gambler.id, activeBet.gambler.id));
    }

    // add endedAt isWin and matchId to bet
    await db
        .update(bet)
        .set({ endedAt: new Date(), isWin, matchId: game.metadata.matchId })
        .where(eq(bet.id, activeBet.bet.id));

    const newBet = (
        await db
            .select()
            .from(bet)
            .where(eq(bet.id, activeBet.bet.id))
            .leftJoin(gambler, eq(bet.gamblerId, gambler.id))
            .leftJoin(summoner, eq(bet.summonerId, summoner.puuid))
            .limit(1)
    )?.[0];

    console.log(newBet);

    return { ...newBet, match: game };
};

export type AchievedBet = {
    bet: Bet;
    gambler: Gambler;
    summoner: Summoner;
    match: Galeforce.dto.MatchDTO;
};

const getGameMatchingBet = async (
    activeBet: { bet: Bet; gambler: Gambler; summoner: Summoner },
    gameCache?: GameCache
) => {
    const betDate = subMinutes(activeBet.bet.createdAt, ENV.CRON_BETS_DELAY_MIN);
    console.log("bet createdAt", activeBet.bet.createdAt, ENV.CRON_BETS_DELAY_MIN);
    console.log("betDate", betDate);

    console.log(
        "fetching game matching bet",
        activeBet.bet.id,
        "for",
        activeBet.summoner.currentName,
        Math.round(betDate.getTime() / 1000)
    );
    const lastGames = await galeforce.lol.match
        .list()
        .region(galeforce.region.riot.EUROPE)
        .puuid(activeBet.summoner.puuid)
        .query({ startTime: Math.round(betDate.getTime() / 1000), count: 5, queue: 420 })
        .exec();
    await addRequest();

    console.log(lastGames);
    if (!lastGames?.length) return null;

    console.log("found", lastGames.length, "games", lastGames.join(", "));
    const game = await getMatchIdAfterDate(lastGames, betDate, gameCache);
    if (!game) return null;

    console.log("match", game?.metadata.matchId, "is after", betDate.toISOString(), "for bet", activeBet.bet.id);
    return game;
};

export const insertMatchFromMatchDto = async (game: Galeforce.dto.MatchDTO, puuid: string) => {
    const existing = await db
        .select()
        .from(match)
        .where(and(eq(match.matchId, game.metadata.matchId), eq(match.summonerId, puuid)))
        .limit(1);

    if (existing?.[0]) return;

    const participantIndex = game.info.participants.findIndex((p) => p.puuid === puuid);
    const participant: Participant = game.info.participants[participantIndex];

    const isWin = participant.win;
    const kda = `${participant.kills}/${participant.deaths}/${participant.assists}`;

    return db.insert(match).values({
        startedAt: new Date(game.info.gameStartTimestamp),
        matchId: game.metadata.matchId,
        endedAt: new Date(game.info.gameEndTimestamp),
        isWin,
        kda,
        participantIndex,
        championName: participant.championName,
        summonerId: puuid,
        details: game,
    });
};

const getMatchIdAfterDate = async (gameIds: string[], betDate: Date, gameCache?: GameCache) => {
    for (const gameId of gameIds) {
        const fromCache = gameCache?.get(gameId);
        const game = await getGameFromCacheOrFetch(gameId, gameCache);

        if (!fromCache) gameCache?.set(gameId, game);

        const isRemake = isMatchRemake(game);
        console.log("game", gameId, "isRemake", isRemake, "timestamp:", new Date(game.info.gameStartTimestamp));

        if (new Date(game.info.gameStartTimestamp) > betDate && !isRemake) return game;
    }

    return null;
};

const getGameFromCacheOrFetch = async (gameId: string, gameCache?: GameCache) => {
    const fromCache = gameCache?.get(gameId);
    if (fromCache) return fromCache;

    const game = await galeforce.lol.match.match().region(galeforce.region.riot.EUROPE).matchId(gameId).exec();
    await addRequest();
    gameCache?.set(gameId, game);

    return game;
};

export const isMatchRemake = (game: Galeforce.dto.MatchDTO) => {
    return game.info.participants.some((p) => p.teamEarlySurrendered);
};
