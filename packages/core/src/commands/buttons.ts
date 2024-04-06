import { db } from "@/db/db";
import { match } from "@/db/schema";
import { Templates, generateTemplateBuffer } from "@/features/details/templates";
import { getComponentsRow } from "@/features/stalker/lol/embeds";
import { ButtonBuilder } from "@discordjs/builders";
import { ButtonInteraction, ButtonStyle } from "discord.js";
import { eq } from "drizzle-orm";

const commandToTemplateName: Record<string, Templates> = {
    details: "MatchDetails",
    damages: "MatchDamage",
    stats: "MatchRandomInformations",
};

export const executeButtonInteraction = async (interaction: ButtonInteraction) => {
    const [command, matchId, participantIndexRaw] = interaction.customId.split("-");
    const participantIndex = participantIndexRaw === "undefined" ? undefined : Number(participantIndexRaw);

    if (command === "close") {
        const row = getComponentsRow({ matchId, participantIndex });

        await interaction.message.edit({
            files: [],
            // @ts-ignore - discordjs typings are wrong
            components: [row],
        });

        return void interaction.deferUpdate();
    }

    if (!matchId) {
        return void console.log("No matchId found in customId", interaction.customId);
    }

    const game = await db.select().from(match).where(eq(match.matchId, matchId)).limit(1);
    if (!game[0]) {
        return void console.log("No game found for matchId", matchId);
    }

    const { details, participantIndex: pIndex } = game[0];
    const index = participantIndex ?? pIndex;

    const participant = details.info.participants[Number(index)];

    const file = await generateTemplateBuffer({
        match: details,
        participant,
        template: commandToTemplateName[command],
    });

    const closeButton = new ButtonBuilder()
        .setCustomId(`close-${matchId}-${index}`)
        .setLabel("Close")
        .setStyle(ButtonStyle.Danger);

    const row = getComponentsRow({ matchId, additionalComponents: [closeButton], participantIndex: index });

    await interaction.message.edit({
        files: [file],
        // @ts-ignore - discordjs typings are wrong
        components: [row],
    });

    return void interaction.deferUpdate();
};
