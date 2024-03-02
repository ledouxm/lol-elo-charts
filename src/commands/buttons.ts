import { db } from "@/db/db";
import { match } from "@/db/schema";
import { createMatchDamageFile } from "@/features/details/matchDamage";
import { createMatchDetailsFile } from "@/features/details/matchDetails";
import { galeforce } from "@/features/summoner";
import { ButtonInteraction } from "discord.js";
import { eq } from "drizzle-orm";

export const executeButtonInteraction = async (interaction: ButtonInteraction) => {
    if (interaction.customId.startsWith("details")) {
        const matchId = interaction.customId.split("-")[1];

        if (!matchId) {
            return void console.log("No matchId found in customId", interaction.customId);
        }

        const game = await db.select().from(match).where(eq(match.matchId, matchId)).limit(1);
        if (!game[0]) {
            return void console.log("No game found for matchId", matchId);
        }

        const { details, participantIndex } = game[0];
        const participant = details.info.participants[participantIndex];

        const file = await createMatchDetailsFile(details, participant);

        await interaction.message.edit({
            files: [file],
        });

        return void interaction.deferUpdate();
    }

    if (interaction.customId.startsWith("damages")) {
        const matchId = interaction.customId.split("-")[1];

        if (!matchId) {
            return void console.log("No matchId found in customId", interaction.customId);
        }

        const game = await db.select().from(match).where(eq(match.matchId, matchId)).limit(1);
        if (!game[0]) {
            return void console.log("No game found for matchId", matchId);
        }

        const { details, participantIndex } = game[0];
        const participant = details.info.participants[participantIndex];

        const file = await createMatchDamageFile(details, participant);

        await interaction.message.edit({
            files: [file],
        });

        return void interaction.deferUpdate();
    }
};
