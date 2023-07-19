import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { addSummoner, removeSummoner } from "../routes";
import { db } from "../db/db";
import { summoner } from "src/db/schema";
import { eq } from "drizzle-orm";
import { EmbedBuilder } from "@discordjs/builders";

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

    @Slash({ name: "listsummoners", description: "List all summoners being tracked" })
    async listSummoners(interaction: CommandInteraction) {
        const summoners = await db.select().from(summoner).where(eq(summoner.channelId, interaction.channelId));

        const embed = new EmbedBuilder()
            .setTitle("Summoner tracked on this channel")
            .setDescription(summoners.map((s) => s.currentName).join("\n"));

        interaction.reply({ embeds: [embed] });
    }
}
