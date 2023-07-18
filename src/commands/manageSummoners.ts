import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { addSummoner, removeSummoner } from "../routes";

@Discord()
export class ManageSummoner {
    @Slash({ name: "addsummoner", description: "Add a summoner to the list of summoners to track" })
    async addSummoner(
        @SlashOption({
            description: "Summoner name",
            name: "name",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        name: string,
        interaction: CommandInteraction
    ) {
        console.log("addSummoner", name);
        await addSummoner(name, interaction.channelId);
        interaction.reply("Added summoner " + name);
    }

    @Slash({ name: "removesummoner", description: "Remove a summoner from the list of summoners to track" })
    async removeSummoner(
        @SlashOption({
            description: "Summoner name",
            name: "name",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        name: string,
        interaction: CommandInteraction
    ) {
        console.log("removeSummoner");
        await removeSummoner(name, interaction.channelId);
        interaction.reply("Removed summoner " + name);
    }
}
