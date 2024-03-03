import { db } from "@/db/db";
import { match } from "@/db/schema";
import { createMatchDamageFile } from "@/features/details/matchDamage";
import { createMatchDetailsFile } from "@/features/details/matchDetails";
import { getComponentsRow } from "@/features/lol/elo";
import { ButtonBuilder } from "@discordjs/builders";
import { ButtonInteraction, ButtonStyle } from "discord.js";
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

        const closeButton = new ButtonBuilder()
            .setCustomId(`close-${matchId}`)
            .setLabel("Close")
            .setStyle(ButtonStyle.Danger);

        const row = getComponentsRow(matchId, [closeButton]);

        await interaction.message.edit({
            files: [file],
            components: [row],
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

        const closeButton = new ButtonBuilder()
            .setCustomId(`close-${matchId}`)
            .setLabel("Close")
            .setStyle(ButtonStyle.Danger);

        const row = getComponentsRow(matchId, [closeButton]);

        await interaction.message.edit({
            files: [file],
            components: [row],
        });

        return void interaction.deferUpdate();
    }

    if (interaction.customId.startsWith("close")) {
        const matchId = interaction.customId.split("-")[1];

        if (!matchId) {
            return void console.log("No matchId found in customId", interaction.customId);
        }

        const row = getComponentsRow(matchId);

        await interaction.message.edit({
            files: [],
            components: [row],
        });

        return void interaction.deferUpdate();
    }
};
