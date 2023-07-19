import { EmbedBuilder } from "@discordjs/builders";
import { InferModel, and, desc, eq, isNull, lt } from "drizzle-orm";
import Galeforce from "galeforce";
import { db } from "./db/db";
import { Gambler, InsertRank, apex, bet, gambler, rank, summoner } from "./db/schema";
import { sendToChannelId } from "./discord";
import { getProfileIconUrl } from "./icons";
import { MinimalRank, areRanksEqual, formatRank, getRankDifference } from "./utils";
import { makeTierLps } from "./lps";
import { getArrow, getColor, getEmoji } from "./getColor";
import { generate24hRecaps } from "./generate24hRecap";

const galeforce = new Galeforce({ "riot-api": { key: process.env.RG_API_KEY } });

export const addSummoner = async (name: string, channelId: string) => {
    try {
        const riotSummoner = await galeforce.lol.summoner().region(galeforce.region.lol.EUROPE_WEST).name(name).exec();

        const identifier = { puuid: summoner.puuid, channelId };

        const existing = (
            await db
                .select()
                .from(summoner)
                .where(and(eq(summoner.puuid, riotSummoner.puuid), eq(summoner.channelId, channelId)))
                .limit(1)
        )?.[0];
        if (existing) {
            await db
                .update(summoner)
                .set({ isActive: true, currentName: riotSummoner.name })
                .where(eq(summoner.puuid, riotSummoner.puuid));

            return identifier;
        }

        await db.insert(summoner).values({
            puuid: riotSummoner.puuid,
            id: riotSummoner.id,
            channelId,
            icon: riotSummoner.profileIconId,
            currentName: riotSummoner.name,
        });

        return identifier;
    } catch (e) {
        console.log(e);
        throw e;
    }
};

export const removeSummoner = async (name: string, channelId: string) => {
    try {
        const existing = (
            await db
                .select()
                .from(summoner)
                .where(and(eq(summoner.currentName, name), eq(summoner.channelId, channelId)))
                .limit(1)
        )?.[0];

        if (!existing) throw new Error("Summoner not found");

        await db
            .update(summoner)
            .set({ isActive: false })
            .where(and(eq(summoner.currentName, name), eq(summoner.channelId, channelId)));

        return "ok";
    } catch (e) {
        console.log(e);
        throw e;
    }
};

const getApex = async () => {
    const masters = await galeforce.lol.league
        .league()
        .queue(galeforce.queue.lol.RANKED_SOLO)
        .tier(galeforce.tier.MASTER)
        .region(galeforce.region.lol.EUROPE_WEST)
        .exec();
    const grandmasters = await galeforce.lol.league
        .league()
        .queue(galeforce.queue.lol.RANKED_SOLO)
        .tier(galeforce.tier.GRANDMASTER)
        .region(galeforce.region.lol.EUROPE_WEST)
        .exec();
    const challengers = await galeforce.lol.league
        .league()
        .queue(galeforce.queue.lol.RANKED_SOLO)
        .tier(galeforce.tier.CHALLENGER)
        .region(galeforce.region.lol.EUROPE_WEST)
        .exec();

    const getMaxLp = (league: Galeforce.dto.LeagueListDTO) => {
        return Math.max(...league.entries.map((e) => e.leaguePoints));
    };

    return { master: getMaxLp(masters), grandmaster: getMaxLp(grandmasters), challenger: getMaxLp(challengers) };
};

export const getAndSaveApex = async () => {
    console.log("retrieving apex at ", new Date().toISOString());
    const riotApex = await getApex();

    await db.insert(apex).values(riotApex);

    return generate24hRecaps();
};

export const giveEveryone500Points = async () => {
    const gamblers = await db.select().from(gambler);

    for (const g of gamblers) {
        await db
            .update(gambler)
            .set({ points: g.points + 500 })
            .where(eq(gambler.id, gambler.id));
    }
};

export const getSummonersWithChannels = async () => {
    const allSummoners = await db.select().from(summoner).where(eq(summoner.isActive, true));
    const summoners = allSummoners.reduce((acc, s) => {
        const index = acc.findIndex((a) => a.puuid === s.puuid);
        if (index !== -1) {
            acc[index].channels.push(s.channelId);
        } else acc.push({ ...s, channels: [s.channelId] });

        return acc;
    }, [] as (InferModel<typeof summoner, "select"> & { channels: string[] })[]);

    return summoners;
};

export const checkElo = async () => {
    const summoners = await getSummonersWithChannels();

    console.log(
        "checking elo for summoners: ",
        summoners
            .map((s) => `${s.currentName} (${s.channels.length} channel${s.channels.length ? "s" : ""})`)
            .join(", "),
        " at ",
        new Date().toISOString()
    );

    for (const summ of summoners) {
        try {
            const summonerData = await galeforce.lol
                .summoner()
                .region(galeforce.region.lol.EUROPE_WEST)
                .puuid(summ.puuid)
                .exec();

            if (summonerData.name !== summ.currentName) {
                await db.update(summoner).set({ currentName: summonerData.name }).where(eq(summoner.puuid, summ.puuid));
            }

            const elos = await galeforce.lol.league
                .entries()
                .summonerId(summ.id)
                .region(galeforce.region.lol.EUROPE_WEST)
                .queue(galeforce.queue.lol.RANKED_SOLO)
                .exec();

            const elo = elos.find((e) => e.queueType === "RANKED_SOLO_5x5");
            if (!elo) continue;

            const newRank = {
                tier: elo.tier as InsertRank["tier"],
                division: elo.rank as InsertRank["division"],
                leaguePoints: elo.leaguePoints,
            };

            const lastRanks = await db
                .select()
                .from(rank)
                .where(eq(rank.summonerId, summ.puuid))
                .orderBy(desc(rank.createdAt))
                .limit(1);

            const lastRank = lastRanks?.[0] as InsertRank;

            await db
                .update(summoner)
                .set({ icon: summonerData.profileIconId, currentName: summonerData.name, checkedAt: new Date() })
                .where(eq(summoner.puuid, summ.puuid));
            console.log(newRank, lastRank && areRanksEqual(lastRank, newRank));
            if (lastRank && areRanksEqual(lastRank, newRank)) continue;

            await db.insert(rank).values({
                summonerId: summ.puuid!,
                ...newRank,
            });

            const bets = await checkBetsAndGetLastGame(summ.puuid!);

            const embedBuilder = await getMessageContent({ lastRank, rank: newRank, summ, elo, bets });

            summ.channels.forEach((c) => sendToChannelId(c, embedBuilder));
        } catch (e) {
            console.log(e);
        }
    }
};

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

    const lastGameIds = await galeforce.lol.match.list().region(galeforce.region.riot.EUROPE).puuid(summonerId).exec();

    const summ = (await db.select().from(summoner).where(eq(summoner.puuid, summonerId)).limit(1))?.[0];

    if (!summ) throw new Error("Summoner not found");
    const lastGame = await galeforce.lol.match
        .match()
        .region(galeforce.region.riot.EUROPE)
        .matchId(lastGameIds[0])
        .exec();

    const newBets = [] as AchievedBet[];

    for (const activeBet of activeBets) {
        const newBet = await tryToResolveBet({ activeBet, summ, lastGameIds, lastGame });
        if (newBet) newBets.push(newBet);
    }

    return newBets;
};

const tryToResolveBet = async ({
    activeBet,
    summ,
    lastGameIds,
    lastGame,
}: {
    activeBet: { bet: InferModel<typeof bet, "select">; gambler: Gambler };
    summ: InferModel<typeof summoner, "select">;
    lastGameIds: string[];
    lastGame?: Galeforce.dto.MatchDTO;
}) => {
    const hasOnlyOneNewGame = lastGameIds.findIndex((id) => id === summ.lastGameId) === 0;

    const game = hasOnlyOneNewGame ? lastGame : await getGameMatchingBet(activeBet, summ);
    if (!game) return;

    const isWin = game.info.participants.find((p) => p.puuid === summ.puuid)?.win === activeBet.bet.hasBetOnWin;

    if (isWin) {
        await db
            .update(gambler)
            .set({ points: activeBet.gambler.points + activeBet.bet.points * 2 })
            .where(eq(gambler.id, gambler.id));
    }

    await db
        .update(bet)
        .set({ endedAt: new Date(), isWin, matchId: game.metadata.matchId })
        .where(eq(bet.id, activeBet.bet.id));

    return db
        .select()
        .from(bet)
        .where(eq(bet.id, activeBet.bet.id))
        .limit(1)
        .leftJoin(gambler, eq(bet.gamblerId, gambler.id))
        .leftJoin(summoner, eq(bet.summonerId, summoner.puuid))
        .limit(1)?.[0];
};

type AchievedBet = {
    bet: InferModel<typeof bet, "select">;
    gambler: Gambler;
    summoner: InferModel<typeof summoner, "select">;
};

const getGameMatchingBet = async (
    activeBet: { bet: InferModel<typeof bet, "select">; gambler: Gambler },
    summ: InferModel<typeof summoner, "select">
) => {
    console.log("fetching game matching bet", activeBet.bet.id, "for", summ.currentName);
    const lastGame = await galeforce.lol.match
        .list()
        .region(galeforce.region.riot.EUROPE)
        .puuid(summ.puuid)
        .query({ startTime: Math.round(activeBet.bet.createdAt.getTime() / 1000), count: 1, queue: 420 })
        .exec();

    console.log({ lastGame, time: activeBet.bet.createdAt.getTime() / 1000 });
    if (!lastGame?.length) return null;
    return galeforce.lol.match.match().region(galeforce.region.riot.EUROPE).matchId(lastGame[0]).exec();
};

const getMessageContent = async ({
    lastRank,
    rank,
    summ,
    elo,
    bets,
}: {
    lastRank: MinimalRank;
    rank: MinimalRank;
    summ: InferModel<typeof summoner, "select">;
    elo: Galeforce.dto.LeagueEntryDTO;
    bets: AchievedBet[];
}) => {
    const profileIcon = await getProfileIconUrl(summ.icon);
    if (!lastRank) {
        return new EmbedBuilder()
            .setColor(0xfbfaa6)
            .setTitle(`${summ.currentName}`)
            .setFields([
                {
                    name: `is now ${formatRank(rank)}`,
                    value: " ",
                },
            ])
            .setThumbnail(profileIcon);
    }
    const rankDifference = getRankDifference(lastRank, rank);

    const isLoss = ["DEMOTION", "LOSS"].includes(rankDifference.type);

    const embed = new EmbedBuilder()
        .setColor(getColor(isLoss))
        .setTitle(summ.currentName)
        .setThumbnail(profileIcon)
        .setFields([
            {
                name: `${getEmoji(isLoss)} ${rankDifference.content}`,
                value: `${rankDifference.from} ${getArrow(isLoss)} ${rankDifference.to}`,
            },
            {
                name: "Wins",
                value: elo.wins.toString(),
                inline: true,
            },
            {
                name: "Losses",
                value: elo.losses.toString(),
                inline: true,
            },
            {
                name: "Winrate",
                value: `${((elo.wins / (elo.wins + elo.losses)) * 100).toFixed(2)}%`,
                inline: true,
            },
            ...bets.map(getAchievedBetFields),
        ]);

    return embed;
};

const getAchievedBetFields = (b: AchievedBet) => {
    const name = `${b.gambler.name} won ${b.bet.points} points`;
    return { name, value: " " };
};
