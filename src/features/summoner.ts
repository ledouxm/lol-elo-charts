import { EmbedBuilder } from "@discordjs/builders";
import { InferModel, and, eq } from "drizzle-orm";
import Galeforce from "galeforce";
import { db } from "../db/db";
import { Summoner, gambler, request, summoner } from "../db/schema";
import { MinimalRank, RankDifference, formatRank, getArrow, getColor, getEmoji, getRankDifference } from "../utils";
import { getChampionIconUrl, getProfileIconUrl } from "./lol/icons";
import { addMinutes, subMinutes } from "date-fns";
import { betDelayInMinutes } from "./bets";

export const addRequest = async () => {
    try {
        await db.insert(request).values({ createdAt: new Date() });
    } catch (e) {
        console.log("cant insert request", e);
    }
};
export const galeforce = new Galeforce({ "riot-api": { key: process.env.RG_API_KEY } });

export const getSummonerByName = async (name: string) => {
    const summoner = await galeforce.lol.summoner().region(galeforce.region.lol.EUROPE_WEST).name(name).exec();
    await addRequest();
    return summoner;
};

export const getQueueRank = async (tier: Galeforce.Tier) => {
    const queue = await galeforce.lol.league
        .league()
        .queue(galeforce.queue.lol.RANKED_SOLO)
        .region(galeforce.region.lol.EUROPE_WEST)
        .tier(tier)
        .exec();
    await addRequest();

    return queue;
};

export const addSummoner = async (riotSummoner: Galeforce.dto.SummonerDTO, channelId: string) => {
    try {
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
    }, [] as SummonerWithChannels[]);

    return summoners;
};

export type SummonerWithChannels = Summoner & { channels: string[] };

type Participant = Galeforce.dto.MatchDTO["info"]["participants"][0];
type Team = Galeforce.dto.MatchDTO["info"]["teams"][0];

export const getParticipant = (match: Galeforce.dto.MatchDTO, summ: Summoner): Participant => {
    return match.info.participants.find((p) => p.puuid === summ.puuid);
};

export const getMatchInformationsForSummoner = async (summ: Summoner, match: Galeforce.dto.MatchDTO) => {
    const participant = getParticipant(match, summ);

    const championIconUrl = await getChampionIconUrl(participant.championName);
    console.log(championIconUrl, participant.championName);
    const team = match.info.teams.find((t) => t.teamId === participant.teamId);

    return {
        participant,
        team,
        championIconUrl,
    } as {
        participant: Participant;
        team: Team;
        championIconUrl: string;
    };
};

// export const getRankEmbed =

export const getFirstRankEmbed = async (
    summ: Summoner,
    rank: MinimalRank,
    elo: Galeforce.dto.LeagueEntryDTO,
    lastMatch?: Galeforce.dto.MatchDTO
) => {
    const profileIcon = await getProfileIconUrl(summ.icon);

    if (!lastMatch)
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

    const { participant, championIconUrl } = await getMatchInformationsForSummoner(summ, lastMatch);

    const isWin = participant.win;

    const embed = new EmbedBuilder()
        .setColor(getColor(!isWin))
        .setTitle(`${summ.currentName}`)
        .setThumbnail(championIconUrl)
        .setDescription(await getMatchDescription(lastMatch, participant))
        .setFields([
            {
                name: `is now ${formatRank(rank)}`,
                value: " ",
            },
            ...getWinRateFields(elo),
        ])
        .setTimestamp(new Date(lastMatch.info.gameEndTimestamp));

    return embed;
};
export const getRankDifferenceEmbed = async ({
    summ,
    elo,
    lastGame,
    rankDifference,
}: {
    summ: Summoner;
    elo: Galeforce.dto.LeagueEntryDTO;
    lastGame?: Galeforce.dto.MatchDTO;
    rankDifference: RankDifference;
}) => {
    if (!lastGame) return getRankDifferenceWithoutGameEmbed({ rankDifference, summ, elo });
    return getRankDifferenceWithMatchEmbed({ rankDifference, summ, elo, lastGame });
};

export const getRankDifferenceWithMatchEmbed = async ({
    summ,
    elo,
    lastGame,
    rankDifference,
}: {
    summ: Summoner;
    elo: Galeforce.dto.LeagueEntryDTO;
    lastGame: Galeforce.dto.MatchDTO;
    rankDifference: RankDifference;
}) => {
    const { participant, championIconUrl } = await getMatchInformationsForSummoner(summ, lastGame);

    const isWin = participant.win;
    const footer = getRankDifferenceString(rankDifference);

    const embed = new EmbedBuilder()
        .setColor(getColor(!isWin))
        .setTitle(`${summ.currentName} (${rankDifference.content})`)
        .setDescription(await getMatchDescription(lastGame, participant))
        .setThumbnail(championIconUrl)
        .setFields(getWinRateFields(elo))
        .setFooter({ text: footer })
        .setTimestamp(new Date(lastGame.info.gameEndTimestamp));

    return embed;
};

export const getRankDifferenceWithoutGameEmbed = async ({
    rankDifference,
    summ,
    elo,
}: {
    rankDifference: RankDifference;
    summ: Summoner;
    elo: Galeforce.dto.LeagueEntryDTO;
}) => {
    const profileIcon = await getProfileIconUrl(summ.icon);

    const isLoss = ["DEMOTION", "LOSS"].includes(rankDifference.type);

    const footer = getRankDifferenceString(rankDifference);

    const embed = new EmbedBuilder()
        .setColor(getColor(isLoss))
        .setTitle(`${summ.currentName} (${rankDifference.content})`)
        .setDescription("Couldn't find a game, is Riot match API down?")
        .setThumbnail(profileIcon)
        .setFields(getWinRateFields(elo))
        .setFooter({ text: footer });

    return embed;
};

const getRankDifferenceString = (rankDifference: RankDifference) => {
    return `${rankDifference.from} ⮞ ${rankDifference.to}`;
};

const getWinRateFields = (elo: Galeforce.dto.LeagueEntryDTO) => {
    return [
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
    ];
};

const getMatchDescription = async (match: Galeforce.dto.MatchDTO, participant: Participant) => {
    return `**${participant.kills}/${participant.deaths}/${participant.assists}** with **${
        participant.championName
    }** (${formatGameDuration(match.info.gameDuration)})`;
};

const formatGameDuration = (gameDuration: number) => {
    const minutes = Math.floor(gameDuration / 60);
    const seconds = gameDuration % 60;

    return `${minutes}:${addZeroIf1Digit(seconds)}`;
};

const addZeroIf1Digit = (number: number) => {
    return number < 10 ? `0${number}` : number;
};

export const getSummonerCurrentGame = async (summonerId: string) => {
    try {
        const activeGame = await galeforce.lol.spectator
            .active()
            .region(galeforce.region.lol.EUROPE_WEST)
            .summonerId(summonerId)
            .exec();
        await addRequest();

        if (
            !activeGame ||
            activeGame.gameQueueConfigId !== 420 ||
            addMinutes(new Date(activeGame.gameStartTime), betDelayInMinutes) > new Date()
        )
            return null;
        return activeGame;
    } catch {
        return null;
    }
};
