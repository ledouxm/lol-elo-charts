import { Bet, Summoner } from "@/db/schema";
import { formatDistanceToNow } from "date-fns";
import { EmbedBuilder } from "discord.js";
import { AchievedBet } from "../bets";

export const getMyBetsMessageEmbed = (betsWithSummoner: { bet: Bet; summoner: Summoner }[]) => {
    const embed = new EmbedBuilder()
        .setTitle("Your bets")
        .setDescription(
            betsWithSummoner
                .map(
                    ({ bet, summoner }) =>
                        bet.points + " on **" + summoner.currentName + "** " + (bet.hasBetOnWin ? "winning" : "losing")
                )
                .join("\n")
        );

    return embed;
};

export const getBetsRecapMessageEmbed = (
    bets: {
        channelId: string;
        gamblerId: number;
        name: string;
        wins: number;
        losses: number;
        result: number;
    }[]
) => {
    const embed = new EmbedBuilder().setTitle("24h Bets Recap").setFields(
        bets.map((b) => ({
            name: b.name,
            value: `${b.result > 0 ? "+" : "-"}${Math.abs(b.result)} (${b.wins}W/${b.losses}L)`,
        }))
    );
    return embed;
};

export const getAchievedBetsMessageContent = async (bets: AchievedBet[]) => {
    const sorted = bets.sort(compareBets);
    const embed = new EmbedBuilder()
        .setTitle("Bets resolved")
        .setColor(0xfbfaa6)
        .setDescription(sorted.map(getAchievedBetString).join("\n"));

    return embed;
};

const compareBets = (a: AchievedBet, b: AchievedBet) => {
    if (a.bet.isWin && !b.bet.isWin) {
        return -1; // a avant b si a a win: true et b n'a pas win: true
    }
    if (!a.bet.isWin && b.bet.isWin) {
        return 1; // b avant a si b a win: true et a n'a pas win: true
    }
    return a.bet.points - b.bet.points; // tri par bet.points
};

const getAchievedBetString = (b: AchievedBet) => {
    const { bet, summoner, gambler, match } = b;
    const { points, isWin, hasBetOnWin } = bet;
    const { currentName } = summoner;

    const icon = isWin ? "✅" : "❌";
    return `${icon} **${gambler.name}** : ${isWin ? "+" : "-"}${points} points on **${currentName}** ${
        hasBetOnWin ? "winning" : "losing"
    } (${formatDistanceToNow(new Date(match.info.gameEndTimestamp), { addSuffix: true })})`;
};

export const getRecapMessageEmbed = ({
    winner,
    loser,
    items,
    streaksAndCounts,
}: {
    winner: Summoner;
    loser?: Summoner;
    items: RecapItem[];
    streaksAndCounts: {
        winnerStreak: number;
        loserStreak?: number;
        winnerCount: number;
        loserCount?: number;
    };
}) => {
    let str = `🥇 **${winner.currentName}** is the best player of the day for the **${ordinal_suffix_of(
        streaksAndCounts.winnerCount
    )}** time (**${streaksAndCounts.winnerStreak}** in a row)`;

    if (loser) {
        str += `\n🦶 **${loser.currentName}** is the worst player of the day for the **${ordinal_suffix_of(
            streaksAndCounts.loserCount
        )}** time (**${streaksAndCounts.loserStreak}** in a row)`;
    }

    const embed = new EmbedBuilder()
        .setTitle("24h Recap")
        .setDescription(str)
        .setFields(items.map((i) => ({ name: i.name, value: i.description })));

    return embed;
};

export type RecapItem = {
    name: string;
    diff: number;
    description: string;
};

function ordinal_suffix_of(i: number) {
    let j = i % 10,
        k = i % 100;
    if (j === 1 && k !== 11) {
        return i + "st";
    }
    if (j === 2 && k !== 12) {
        return i + "nd";
    }
    if (j === 3 && k !== 13) {
        return i + "rd";
    }
    return i + "th";
}
