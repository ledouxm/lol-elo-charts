import { InsertValorantRank, ValorantPlayer } from "@/db/valorantSchema";
import { ValorantMatch, ValorantMmr, ValorantPlayerWithChannels } from "./ValorantService";
import { EmbedBuilder } from "@discordjs/builders";
import { formatValorantMmr } from "./valorant";
import { getColor } from "@/utils";
import { Schemas } from "@/valorantApi.gen";
import { valorantTiers } from "./mmr";

export const getValorantFirstRankEmbed = ({
    player,
    lastMatch,
    newRank,
}: {
    player: ValorantPlayer;
    lastMatch?: ValorantMatch;
    newRank: ValorantMmr;
}) => {
    const title = `${player.currentName} is now ${getTier(newRank)}`;

    if (!lastMatch) {
        const embed = new EmbedBuilder()
            .setColor(0xfbfaa6)
            .setTitle(title)
            .setDescription(`Couldn't retrieve match data`);

        return embed;
    }

    const isWin = newRank.mmr_change_to_last_game > 0;

    const embed = new EmbedBuilder()
        .setColor(getColor(!isWin))
        .setTitle(title)
        .setThumbnail(player.picture)
        .setDescription(getMatchDescription(lastMatch, player))
        .setURL(getMatchLink(lastMatch))
        .setTimestamp(new Date(lastMatch.metadata.game_start * 1000));

    return embed;
};

export const getValorantRankDifferenceEmbed = ({
    player,
    lastMatch,
    newRank,
    lastRank,
}: {
    player: ValorantPlayerWithChannels;
    lastMatch?: ValorantMatch;
    newRank: ValorantMmr;
    lastRank?: InsertValorantRank;
}) => {
    if (!lastRank) {
        return getValorantFirstRankEmbed({ player, lastMatch, newRank });
    }

    if (!lastMatch) {
        return getValorantRankDifferenceWithoutMatchEmbed({ player, newRank, lastRank });
    }
    return getValorantRankDifferenceWithMatchEmbed({ player, lastMatch, newRank, lastRank });
};

export const getValorantRankDifferenceWithMatchEmbed = ({
    player,
    lastMatch,
    newRank,
    lastRank,
}: {
    player: ValorantPlayerWithChannels;
    lastMatch: ValorantMatch;
    newRank: ValorantMmr;
    lastRank: InsertValorantRank;
}) => {
    const isWin = newRank.mmr_change_to_last_game > 0;

    const embed = new EmbedBuilder()
        .setColor(getColor(!isWin))
        .setTitle(getMmrDifferenceMessage({ lastRank, newRank, player }))
        .setThumbnail(player.picture)
        .setDescription(getMatchDescription(lastMatch, player))
        .setTimestamp(new Date(lastMatch.metadata.game_start * 1000))
        .setFooter({ text: getRankDifferenceString({ lastRank, newRank }) })
        .setURL(getMatchLink(lastMatch));

    return embed;
};

export const getValorantRankDifferenceWithoutMatchEmbed = ({
    player,
    newRank,
    lastRank,
}: {
    player: ValorantPlayerWithChannels;
    newRank: ValorantMmr;
    lastRank: InsertValorantRank;
}) => {
    const isWin = newRank.mmr_change_to_last_game > 0;

    const embed = new EmbedBuilder()
        .setColor(getColor(!isWin))
        .setTitle(getMmrDifferenceMessage({ lastRank, newRank, player }))
        .setDescription("Couldn't retrieve match data")
        .setThumbnail(player.picture)
        .setTimestamp(new Date())
        .setFooter({ text: getRankDifferenceString({ lastRank, newRank }) });

    return embed;
};

const getMatchDescription = (match: ValorantMatch, player: ValorantPlayer) => {
    const participant = match.players.all_players.find((p) => p.puuid === player.puuid);
    if (!participant) return "Couldn't retrieve match data";

    const { blue, red } = getMatchScore(match);
    const maxScore = Math.max(blue, red);
    const sorted =
        participant.team === "Blue"
            ? [blue, red]
            : [red, blue].map((score) => (score === maxScore ? emphasize(score.toString()) : score));

    return `${sorted.join("-")} on **${match.metadata.map}** (${secondsToMinutes(
        match.metadata.game_length
    )})- **${getKDAString(participant)}** with **${participant.character}**`;
};

const emphasize = (text: string) => `**${text}**`;

const getMatchScore = (match: ValorantMatch) => {
    return match.rounds.reduce(
        (acc, round) => {
            if (round.winning_team === "Blue") acc.blue++;
            if (round.winning_team === "Red") acc.red++;

            return acc;
        },
        { blue: 0, red: 0 }
    );
};

const getKDAString = (participant: Schemas.player) => {
    const { kills, deaths, assists } = participant.stats;
    return `${kills}/${deaths}/${assists}`;
};

const secondsToMinutes = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const getMmrDifferenceMessage = ({
    lastRank,
    newRank,
    player,
}: {
    lastRank: InsertValorantRank;
    newRank: ValorantMmr;
    player: ValorantPlayer;
}) => {
    const lastTierIndex = Math.floor(lastRank.elo / 100);
    const newTierIndex = Math.floor(newRank.elo / 100);

    const tierDifference = newTierIndex - lastTierIndex;
    const eloDifference = newRank.elo - lastRank.elo;

    if (tierDifference < 0) {
        return `${player.currentName} (DEMOTED TO ${valorantTiers[newTierIndex]})`;
    }

    if (tierDifference > 0) {
        return `${player.currentName} (PROMOTED TO ${valorantTiers[newTierIndex]})`;
    }

    return `${player.currentName} (${eloDifference > 0 ? "+" : ""}${eloDifference} RR)`;
};

const getRankDifferenceString = ({ lastRank, newRank }: { lastRank: InsertValorantRank; newRank: ValorantMmr }) => {
    return `${formatValorantMmr(lastRank)} > ${formatValorantMmr(newRank)}`;
};

const getMatchLink = (lastMatch: ValorantMatch) => {
    return `https://tracker.gg/valorant/match/${lastMatch.metadata.matchid}`;
};

export const getTier = (rank: ValorantMmr) => {
    const index = Math.floor(rank.elo / 100);
    return valorantTiers[index].toUpperCase();
};
