import { db } from "@/db/db";
import { match } from "@/db/schema";
import { createMatchDamageFile } from "@/features/details/matchDamage";
import { createMatchDetailsFile } from "@/features/details/matchDetails";
import { getComponentsRow } from "@/features/lol/elo";
import { ButtonBuilder } from "@discordjs/builders";
import { ButtonInteraction, ButtonStyle } from "discord.js";
import { eq } from "drizzle-orm";

export const executeButtonInteraction = async (interaction: ButtonInteraction) => {
    const [command, matchId, participantIndexRaw] = interaction.customId.split("-");
    const participantIndex = participantIndexRaw === "undefined" ? undefined : participantIndexRaw;

    if (command === "details") {
        if (!matchId) {
            return void console.log("No matchId found in customId", interaction.customId);
        }

        const game = await db.select().from(match).where(eq(match.matchId, matchId)).limit(1);
        if (!game[0]) {
            return void console.log("No game found for matchId", matchId);
        }

        const { details, participantIndex: pIndex } = game[0];
        const index = participantIndex ?? pIndex;

        console.log({ index, participantIndex, pIndex, id: interaction.customId });
        const participant = details.info.participants[Number(index)];

        const file = await createMatchDetailsFile(details, participant);

        const closeButton = new ButtonBuilder()
            .setCustomId(`close-${matchId}`)
            .setLabel("Close")
            .setStyle(ButtonStyle.Danger);

        const row = getComponentsRow({ matchId, additionalComponents: [closeButton], participantIndex: pIndex });

        await interaction.message.edit({
            files: [file],
            // @ts-ignore - discordjs typings are wrong
            components: [row],
        });

        return void interaction.deferUpdate();
    }

    if (command === "damages") {
        if (!matchId) {
            return void console.log("No matchId found in customId", interaction.customId);
        }

        const game = await db.select().from(match).where(eq(match.matchId, matchId)).limit(1);
        if (!game[0]) {
            return void console.log("No game found for matchId", matchId);
        }

        const { details, participantIndex: pIndex } = game[0];
        const index = participantIndex ?? pIndex;

        console.log({ index, participantIndex, pIndex, id: interaction.customId });
        const participant = details.info.participants[Number(index)];

        const file = await createMatchDamageFile(details, participant);

        const closeButton = new ButtonBuilder()
            .setCustomId(`close-${matchId}`)
            .setLabel("Close")
            .setStyle(ButtonStyle.Danger);

        const row = getComponentsRow({ matchId, additionalComponents: [closeButton], participantIndex: pIndex });

        await interaction.message.edit({
            files: [file],
            // @ts-ignore - discordjs typings are wrong
            components: [row],
        });

        return void interaction.deferUpdate();
    }

    if (command === "close") {
        if (!matchId) {
            return void console.log("No matchId found in customId", interaction.customId);
        }

        const row = getComponentsRow({ matchId, participantIndex });

        await interaction.message.edit({
            files: [],
            // @ts-ignore - discordjs typings are wrong
            components: [row],
        });

        return void interaction.deferUpdate();
    }
};
