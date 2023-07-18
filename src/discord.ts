import { dirname, importx } from "@discordx/importer";
import type { Embed, EmbedBuilder, Interaction, Message, TextChannel } from "discord.js";
import { IntentsBitField } from "discord.js";
import { Client, MetadataStorage } from "discordx";
import "./commands/manageSummoners";

export const bot = new Client({
    // To use only guild command
    // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
    botId: "test",

    // Discord intents
    intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],

    // Debug logs are disabled in silent mode
    silent: false,
});

bot.once("ready", async () => {
    // Make sure all guilds are cached
    await bot.guilds.fetch();

    // Synchronize applications commands with Discord
    await bot.initApplicationCommands();

    // To clear all guild commands, uncomment this line,
    // This is useful when moving from guild commands to global commands
    // It must only be executed once
    //
    //  await bot.clearApplicationCommands(
    //    ...bot.guilds.cache.map((g) => g.id)
    //  );

    console.log("Bot started");
});

bot.on("interactionCreate", (interaction: Interaction) => {
    bot.executeInteraction(interaction);
});

bot.on("messageCreate", (message: Message) => {
    bot.executeCommand(message);
});

export const startDiscordBot = async () => {
    // The following syntax should be used in the commonjs environment
    //
    // await importx(__dirname + "/{events,commands}/**/*.{ts,js}");

    // The following syntax should be used in the ECMAScript environment
    // Let's start the bot
    if (!process.env.BOT_TOKEN) {
        throw Error("Could not find BOT_TOKEN in your environment");
    }

    // Log in with your bot token
    await bot.login(process.env.BOT_TOKEN);
};

export const sendToChannelId = async (channelId: string, embed: EmbedBuilder | string) => {
    const channel = bot.channels.cache.get(channelId);
    if (!channel) {
        console.log("Could not find channel", channelId);
        return;
    }

    console.log("Sending to channel", channelId, channel.type);

    if (typeof embed === "string") {
        await (channel as TextChannel).send(embed);
        return;
    }

    await (channel as TextChannel).send({ embeds: [embed] });
};
