import { db } from "@/db/db";
import { match } from "@/db/schema";
import { valorantMatch } from "@/db/valorantSchema";
import { Templates, generateTemplateBuffer } from "@/features/details/templates";
import { getComponentsRow } from "@/features/stalker/lol/embeds";
import { getComponentsRow as getValorantComponentsRow} from "@/features/stalker/valorant/embeds";
import { ButtonBuilder } from "@discordjs/builders";
import { ButtonInteraction, ButtonStyle } from "discord.js";
import { eq } from "drizzle-orm";

const commandToTemplateName: Record<string, Templates> = {
    leagueDetails: "MatchDetails",
    leagueDamages: "MatchDamage",
    leagueStats: "MatchRandomInformations",
    valorantMatchDetails: "ValorantMatchDetails",
};

export const executeButtonInteraction = async (interaction: ButtonInteraction) => {
    const [game, command, matchId, participantIndexRaw] = interaction.customId.split("_");
    const participantIndex = participantIndexRaw === "undefined" ? undefined : Number(participantIndexRaw);
    const isValorant = game == "valorant";
    if (command === "close") {
        const row =  isValorant ? getValorantComponentsRow({ matchId, participantIndex }) : getComponentsRow({ matchId, participantIndex });
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

    const matchObject = isValorant ? await db.select().from(valorantMatch).where(eq(valorantMatch.id, matchId)).limit(1) : await db.select().from(match).where(eq(match.matchId, matchId)).limit(1);
    if (!matchObject[0]) {
        return void console.log("No game found for matchId", matchId);
    }
    
    

    const { details } = matchObject[0]; //TODO
        //, participantIndex: pIndex
        
    const index = participantIndex; //?? pIndex;

    const participant = isValorant ? details.players.all_players[index] : details.info.participants[index];
    console.log(game+command)
    const file = await generateTemplateBuffer({
        match: details,
        participant,
        template: commandToTemplateName[game+command],
    });

    const closeButton = new ButtonBuilder()
        .setCustomId(`${game}_close_${matchId}_${index}`)
        .setLabel("Close")
        .setStyle(ButtonStyle.Danger);

    const row = isValorant ? getValorantComponentsRow({ matchId, additionalComponents: [closeButton], participantIndex: index }) : getComponentsRow({ matchId, additionalComponents: [closeButton], participantIndex: index });

    await interaction.message.edit({
        files: [file],
        // @ts-ignore - discordjs typings are wrong
        components: [row],
    });

    return void interaction.deferUpdate();
};
