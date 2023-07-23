import { InferModel, and, eq, isNull } from "drizzle-orm";
import Galeforce from "galeforce";
import { db } from "../db/db";
import { Bet, Gambler, Summoner, bet, gambler, match, summoner } from "../db/schema";
import { Participant, addRequest, galeforce } from "./summoner";
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

    console.log("resolved", newBets.length, "bets");

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

    await insertMatchFromMatchDto(game, activeBet.summoner.puuid);

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
    console.log("bet createdAt", activeBet.bet.createdAt, betDelayInMinutes);
    console.log("betDate", betDate);

    console.log("fetching game matching bet", activeBet.bet.id, "for", activeBet.summoner.currentName);
    const lastGames = await galeforce.lol.match
        .list()
        .region(galeforce.region.riot.EUROPE)
        .puuid(activeBet.summoner.puuid)
        .query({ startTime: Math.round(betDate.getTime() / 1000), count: 5, queue: 420 })
        .exec();
    await addRequest();

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

    const participant: Participant = game.info.participants.find((p) => p.puuid === puuid);

    const isWin = participant.win;
    const kda = `${participant.kills}/${participant.deaths}/${participant.assists}`;

    return db.insert(match).values({
        startedAt: new Date(game.info.gameStartTimestamp),
        matchId: game.metadata.matchId,
        endedAt: new Date(game.info.gameEndTimestamp),
        isWin,
        kda,
        championName: participant.championName,
        summonerId: puuid,
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

const isMatchRemake = (game: Galeforce.dto.MatchDTO) => {
    return game.info.participants.some((p) => p.teamEarlySurrendered);
};

export const getLastGame = async (summoner: Summoner) => {
    const lastGames = await galeforce.lol.match
        .list()
        .region(galeforce.region.riot.EUROPE)
        .puuid(summoner.puuid)
        .query({ count: 1, queue: 420 })
        .exec();
    await addRequest();

    if (!lastGames?.[0]) return null;

    const match = await galeforce.lol.match.match().region(galeforce.region.riot.EUROPE).matchId(lastGames[0]).exec();
    await addRequest();
    if (match?.info.participants.some((p) => p.teamEarlySurrendered)) return null;

    return match;
};
