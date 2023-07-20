import { InferModel, and, eq, isNull } from "drizzle-orm";
import Galeforce from "galeforce";
import { db } from "../db/db";
import { Gambler, bet, gambler, summoner } from "../db/schema";
import { galeforce } from "./summoner";

export const checkBetsAndGetLastGame = async (summonerId: string) => {
    const activeBets = await db
        .select()
        .from(bet)
        .where(and(eq(bet.summonerId, summonerId), isNull(bet.endedAt)))
        .leftJoin(gambler, eq(bet.gamblerId, gambler.id));

    if (!activeBets?.[0]) {
        void console.log("no bets");
        return [] as AchievedBet[];
    }
    console.log("Checking", activeBets.length, "bets");

    const summ = (await db.select().from(summoner).where(eq(summoner.puuid, summonerId)).limit(1))?.[0];

    if (!summ) throw new Error("Summoner not found");
    const newBets = [] as AchievedBet[];

    const gameCache: GameCache = new Map();

    for (const activeBet of activeBets) {
        const newBet = await tryToResolveBet({ activeBet, summ, gameCache });
        if (newBet) newBets.push(newBet);
    }

    return newBets;
};

type GameCache = Map<string, Galeforce.dto.MatchDTO>;

const tryToResolveBet = async ({
    activeBet,
    summ,
    gameCache,
}: {
    activeBet: { bet: InferModel<typeof bet, "select">; gambler: Gambler };
    summ: InferModel<typeof summoner, "select">;
    gameCache?: GameCache;
}) => {
    const game = await getGameMatchingBet(activeBet, summ, gameCache);
    if (!game) return;

    const isWin = game.info.participants.find((p) => p.puuid === summ.puuid)?.win === activeBet.bet.hasBetOnWin;

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
    bet: InferModel<typeof bet, "select">;
    gambler: Gambler;
    summoner: InferModel<typeof summoner, "select">;
    match: Galeforce.dto.MatchDTO;
};

const getGameMatchingBet = async (
    activeBet: { bet: InferModel<typeof bet, "select">; gambler: Gambler },
    summ: InferModel<typeof summoner, "select">,
    gameCache?: GameCache
) => {
    console.log("fetching game matching bet", activeBet.bet.id, "for", summ.currentName);
    const lastGames = await galeforce.lol.match
        .list()
        .region(galeforce.region.riot.EUROPE)
        .puuid(summ.puuid)
        .query({ startTime: Math.round(activeBet.bet.createdAt.getTime() / 1000), count: 5, queue: 420 })
        .exec();

    if (!lastGames?.length) return null;

    const match = await getMatchIdAfterDate(lastGames, activeBet.bet.createdAt, gameCache);
    // const matchingGame = lastGames.find((g) => new Date(g.gameStartTimestamp).getTime() === activeBet.bet.createdAt.getTime());

    return match;
};

const getMatchIdAfterDate = async (gameIds: string[], date: Date, gameCache?: GameCache) => {
    for (const gameId of gameIds) {
        const fromCache = gameCache?.get(gameId);
        const game =
            fromCache ||
            (await galeforce.lol.match.match().region(galeforce.region.riot.EUROPE).matchId(gameId).exec());

        if (!fromCache) gameCache?.set(gameId, game);

        if (new Date(game.info.gameStartTimestamp) > date) return game;
    }

    return null;
};
