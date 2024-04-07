import { ValorantService, addValorantPlayer, removeValorantPlayer } from "@/features/stalker/valorant/ValorantService";
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

@Discord()
export class ManageValorantPlayer {
    @Slash({ name: "addvalorant", description: "Add a player to the list of players to track" })
    async addSummoner(
        @SlashOption({
            description: "Player name",
            name: "name",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        nameWithMaybeTag: string,
        @SlashOption({
            description: "Tag",
            name: "tag",
            required: false,
            type: ApplicationCommandOptionType.String,
        })
        tag: string,
        interaction: CommandInteraction
    ) {
        try {
            console.log("add valorant", nameWithMaybeTag);
            const [name, maybeTag] = nameWithMaybeTag.split("#");
            const resolvedName = name + "#" + (maybeTag || tag || "EUW");

            const valorantPlayer = await ValorantService.getPlayerByName(resolvedName);

            await addValorantPlayer(valorantPlayer, interaction.channelId);
            interaction.reply("Added Valorant player " + name + "#" + maybeTag || tag || "EUW");
        } catch (e) {
            console.log(e);
            interaction.reply("Valorant player not found");
        }
    }

    @Slash({ name: "removevalorant", description: "Remove a player from the list of players to track" })
    async removeSummoner(
        @SlashOption({
            description: "Player name",
            name: "name",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        name: string,
        interaction: CommandInteraction
    ) {
        console.log("remove valorant");
        await removeValorantPlayer(name, interaction.channelId);
        interaction.reply("Removed Valorant player " + name);
    }
}
