import { Summoner } from "@/db/schema";
import { LoLRankWithWinsLosses } from "./rank";
import { MatchDTO } from "galeforce/dist/galeforce/interfaces/dto";
import { getProfileIconUrl } from "@lol-elo-charts/shared/datadragon";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { RankDifference, formatRank } from "./rankUtils";
import { Participant, getMatchInformationsForSummoner } from "./match";
import { getColor } from "@/utils";
import Galeforce from "galeforce";

export const getFirstRankEmbed = async ({
    player,
    newRank,
    lastMatch,
}: {
    player: Summoner;
    newRank: LoLRankWithWinsLosses;
    lastMatch?: MatchDTO;
}) => {
    const profileIcon = await getProfileIconUrl(player.icon);

    if (!lastMatch)
        return new EmbedBuilder()
            .setColor(0xfbfaa6)
            .setTitle(`${player.currentName}`)
            .setFields([
                {
                    name: `is now ${formatRank(newRank)}`,
                    value: " ",
                },
            ])
            .setThumbnail(profileIcon);

    const { participant, championIconUrl, participantIndex } = await getMatchInformationsForSummoner(player, lastMatch);

    const isWin = participant.win;

    const embed = new EmbedBuilder()
        .setColor(getColor(!isWin))
        .setTitle(`${player.currentName}`)
        .setThumbnail(championIconUrl)
        .setDescription(await getMatchDescription(lastMatch, participant))
        .setFields([
            {
                name: `is now ${formatRank(newRank)}`,
                value: " ",
            },
            ...getWinRateFields(newRank),
        ])
        .setTimestamp(new Date(lastMatch.info.gameEndTimestamp))
        .setURL(
            `https://www.leagueofgraphs.com/match/euw/${lastMatch.metadata.matchId.slice(5)}#participant${
                participantIndex + 1
            }`
        );

    return embed;
};

export const getRankDifferenceEmbed = async ({
    player,
    newRank,
    lastMatch,
    rankDifference,
}: {
    player: Summoner;
    newRank: LoLRankWithWinsLosses;
    lastMatch?: Galeforce.dto.MatchDTO;
    rankDifference: RankDifference;
}) => {
    if (!lastMatch) return getRankDifferenceWithoutGameEmbed({ rankDifference, player, newRank });
    return getRankDifferenceWithMatchEmbed({ rankDifference, player, newRank, lastMatch });
};

export const getRankDifferenceWithMatchEmbed = async ({
    player,
    newRank,
    lastMatch,
    rankDifference,
}: {
    player: Summoner;
    newRank: LoLRankWithWinsLosses;
    lastMatch: Galeforce.dto.MatchDTO;
    rankDifference: RankDifference;
}) => {
    const { participant, championIconUrl, participantIndex } = await getMatchInformationsForSummoner(player, lastMatch);

    const isWin = participant.win;
    const footer = getRankDifferenceString(rankDifference);

    const embed = new EmbedBuilder()
        .setColor(getColor(!isWin))
        .setTitle(`${player.currentName} (${rankDifference.content})`)
        .setDescription(await getMatchDescription(lastMatch, participant))
        .setThumbnail(championIconUrl)
        .setFields(getWinRateFields(newRank))
        .setFooter({ text: footer })
        .setTimestamp(new Date(lastMatch.info.gameEndTimestamp))
        .setURL(
            `https://www.leagueofgraphs.com/match/euw/${lastMatch.metadata.matchId.slice(5)}#participant${
                participantIndex + 1
            }`
        );

    return embed;
};

export const getRankDifferenceWithoutGameEmbed = async ({
    rankDifference,
    player,
    newRank,
}: {
    rankDifference: RankDifference;
    player: Summoner;
    newRank: LoLRankWithWinsLosses;
}) => {
    const profileIcon = await getProfileIconUrl(player.icon);

    const isLoss = ["DEMOTION", "LOSS"].includes(rankDifference.type);

    const footer = getRankDifferenceString(rankDifference);

    const embed = new EmbedBuilder()
        .setColor(getColor(isLoss))
        .setTitle(`${player.currentName} (${rankDifference.content})`)
        .setDescription("Couldn't find a game, is Riot match API down?")
        .setThumbnail(profileIcon)
        .setFields(getWinRateFields(newRank))
        .setFooter({ text: footer });

    return embed;
};

const getRankDifferenceString = (rankDifference: RankDifference) => {
    return `${rankDifference.from} > ${rankDifference.to}`;
};

const getWinRateFields = (newRank: LoLRankWithWinsLosses) => {
    return [
        {
            name: "Wins",
            value: newRank.wins.toString(),
            inline: true,
        },
        {
            name: "Losses",
            value: newRank.losses.toString(),
            inline: true,
        },
        {
            name: "Winrate",
            value: `${((newRank.wins / (newRank.wins + newRank.losses)) * 100).toFixed(2)}%`,
            inline: true,
        },
    ];
};

export const getDamageDealtPercent = (match: Galeforce.dto.MatchDTO, participant: Participant) => {
    const participantsInTeam = match.info.participants.filter((p) => p.teamId === participant.teamId);
    const totalDamage = participantsInTeam.reduce((acc, p) => acc + p.totalDamageDealtToChampions, 0);

    return Math.round((participant.totalDamageDealtToChampions / totalDamage) * 100);
};

export const getKillParticipation = (match: Galeforce.dto.MatchDTO, participant: Participant) => {
    const participantsInTeam = match.info.participants.filter((p) => p.teamId === participant.teamId);
    const teamKills = participantsInTeam.reduce((acc, p) => acc + p.kills, 0);

    return Math.round(((participant.kills + participant.assists) / teamKills) * 100);
};

const getMatchDescription = async (match: Galeforce.dto.MatchDTO, participant: Participant) => {
    return `**${participant.kills}/${participant.deaths}/${participant.assists}** with **${
        participant.championName
    }** (${formatGameDuration(match.info.gameDuration)}) - **${getDamageDealtPercent(
        match,
        participant
    )}%** of team's damage and **${getKillParticipation(match, participant)}%** KP`;
};

const formatGameDuration = (gameDuration: number) => {
    const minutes = Math.floor(gameDuration / 60);
    const seconds = gameDuration % 60;

    return `${minutes}:${addZeroIf1Digit(seconds)}`;
};

const addZeroIf1Digit = (number: number) => {
    return number < 10 ? `0${number}` : number;
};

export const getComponentsRow = ({
    matchId,
    additionalComponents,
    participantIndex,
}: {
    matchId: string;
    additionalComponents?: ButtonBuilder[];
    participantIndex: number | string;
}) => {
    const detailsButton = new ButtonBuilder()
        .setLabel("Details")
        .setCustomId(`league.Details.${matchId}.${participantIndex}`)
        .setStyle(ButtonStyle.Secondary);

    const damageButton = new ButtonBuilder()
        .setLabel("Damages")
        .setCustomId(`league.Damages.${matchId}.${participantIndex}`)
        .setStyle(ButtonStyle.Secondary);

    const statsButton = new ButtonBuilder()
        .setLabel("Stats")
        .setCustomId(`league.Stats.${matchId}.${participantIndex}`)
        .setStyle(ButtonStyle.Secondary);

    return new ActionRowBuilder().addComponents(
        detailsButton,
        damageButton,
        statsButton,
        ...(additionalComponents || [])
    );
};
