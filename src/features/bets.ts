import { InferModel, and, eq, isNull } from "drizzle-orm";
import Galeforce from "galeforce";
import { db } from "../db/db";
import { Bet, Gambler, Summoner, bet, gambler, summoner } from "../db/schema";
import { galeforce } from "./summoner";
import { subMinutes } from "date-fns";

export const betDelayInMinutes = process.env.BET_DELAY_IN_MINUTES ? Number(process.env.BET_DELAY_IN_MINUTES) : 2;

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
        const newBet = await tryToResolveBet({ activeBet, gameCache });
        if (newBet) newBets.push(newBet);
    }

    return newBets;
};

type GameCache = Map<string, Galeforce.dto.MatchDTO>;

const tryToResolveBet = async ({
    activeBet,
    gameCache,
}: {
    activeBet: { bet: InferModel<typeof bet, "select">; gambler: Gambler; summoner: Summoner };
    gameCache?: GameCache;
}) => {
    const game = await getGameMatchingBet(activeBet, gameCache);
    if (!game) return;

    const isWin =
        game.info.participants.find((p) => p.puuid === activeBet.summoner.puuid)?.win === activeBet.bet.hasBetOnWin;

    if (isWin) {
        // increase points if win
        await db
            .update(gambler)
            .set({ points: activeBet.gambler.points + activeBet.bet.points * 2 })
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
    const betDate = subMinutes(activeBet.bet.createdAt, betDelayInMinutes);

    console.log("fetching game matching bet", activeBet.bet.id, "for", activeBet.summoner.currentName);
    const lastGames = await galeforce.lol.match
        .list()
        .region(galeforce.region.riot.EUROPE)
        .puuid(activeBet.summoner.puuid)
        .query({ startTime: Math.round(betDate.getTime() / 1000), count: 5, queue: 420 })
        .exec();

    if (!lastGames?.length) return null;

    const match = await getMatchIdAfterDate(lastGames, betDate, gameCache);

    return match;
};

const getMatchIdAfterDate = async (gameIds: string[], date: Date, gameCache?: GameCache) => {
    for (const gameId of gameIds) {
        const fromCache = gameCache?.get(gameId);
        const game =
            fromCache ||
            (await galeforce.lol.match.match().region(galeforce.region.riot.EUROPE).matchId(gameId).exec());

        if (!fromCache) gameCache?.set(gameId, game);

        if (new Date(game.info.gameStartTimestamp) > date && !isMatchRemake(game)) return game;
    }

    return null;
};

const isMatchRemake = (game: Galeforce.dto.MatchDTO) => {
    return game.info.participants.some((p) => p.teamEarlySurrendered);
};
