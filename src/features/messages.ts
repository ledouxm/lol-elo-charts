import { Bet, Summoner } from "@/db/schema";
import { EmbedBuilder } from "discord.js";

export const getMyBetsMessageEmbed = (betsWithSummoner: { bet: Bet; summoner: Summoner }[]) => {
    const embed = new EmbedBuilder()
        .setTitle("Your bets")
        .setDescription(
            betsWithSummoner
                .map(
                    ({ bet, summoner }) =>
                        bet.points + " on " + summoner.currentName + " to " + (bet.hasBetOnWin ? "win" : "lose")
                )
                .join("\n")
        );

    return embed;
};

export const getBetsRecapMessageEmbed = (
    bets: {
        gamblerId: string;
        wins: number;
        losses: number;
        result: number;
    }[]
) => {
    const embed = new EmbedBuilder().setTitle("24h Bets Recap").setFields(
        bets.map((b) => ({
            name: b.gamblerId,
            value: `Wins: ${b.wins}\nLosses: ${b.losses}\nResult: ${b.result}`,
        }))
    );
    return embed;
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
