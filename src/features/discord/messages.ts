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
    return `${icon} **${gambler.name}** : ${isWin ? "+" : "-"}${points * 2} points on **${currentName}** ${
        hasBetOnWin ? "winning" : "losing"
    } (${formatDistanceToNow(new Date(match.info.gameEndTimestamp), { addSuffix: true })})`;
};

export const getRecapMessageEmbed = (items: RecapItem[]) => {
    const embed = new EmbedBuilder()
        .setTitle("24h Recap")
        .setFields(items.map((i) => ({ name: i.name, value: i.description })));

    return embed;
};

export type RecapItem = {
    name: string;
    diff: number;
    description: string;
};
