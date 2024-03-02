import { galeforce } from "@/features/summoner";
import { ButtonInteraction } from "discord.js";

export const executeButtonInteraction = async (interaction: ButtonInteraction) => {
    if (interaction.customId.startsWith("game-details")) {
        const matchId = interaction.customId.split("-")[2];

        if (!matchId) {
            return void console.log("No matchId found in customId", interaction.customId);
        }

        const gameDetails = await galeforce.lol.match
            .match()
            .region(galeforce.region.riot.EUROPE)
            .matchId(matchId)
            .exec();
        console.log(gameDetails);
        await interaction.reply("Game details for " + matchId);
    }
};
