import { getCurrentDayRecap } from "@/features/generate24hRecap";
import { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";

@Discord()
export class ManageSummoner {
    @Slash({ name: "today", description: "Show the activity of the summoners today" })
    async today(interaction: CommandInteraction) {
        const embed = await getCurrentDayRecap({ channelId: interaction.channelId });
        interaction.reply({ embeds: [embed] });
    }
}
