import { executeButtonInteraction } from "@/commands/buttons";
import type { Interaction, Message, MessageCreateOptions, TextChannel } from "discord.js";
import { IntentsBitField } from "discord.js";
import { Client } from "discordx";
import "../../commands/bets";
import "../../commands/manageSummoners";
import { makeDebug } from "@/utils";

const debug = makeDebug("discord");

export const bot = new Client({
    // To use only guild command
    // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
    botId: "test",

    // Discord intents
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
    ],

    // Debug logs are disabled in silent mode
    silent: true,
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

    debug("Bot started");
});

bot.on("interactionCreate", (interaction: Interaction) => {
    if (interaction.isButton()) {
        debug("Button interaction", interaction.customId, interaction.user.username);
        return void executeButtonInteraction(interaction);
    }
    if (interaction.isCommand()) {
        debug("Command interaction", interaction.commandName, interaction.user.username);
        return void bot.executeInteraction(interaction);
    }
});

bot.on("messageCreate", (message: Message) => {
    bot.executeCommand(message);
});

export const startDiscordBot = async () => {
    // The following syntax should be used in the ECMAScript environment
    // Let's start the bot
    if (!process.env.BOT_TOKEN) {
        throw Error("Could not find BOT_TOKEN in your environment");
    }

    // Log in with your bot token
    await bot.login(process.env.BOT_TOKEN);
};

export const sendToChannelId = async ({ channelId, message }: { channelId: string; message: MessageCreateOptions }) => {
    try {
        const channel = bot.channels.cache.get(channelId);
        if (!channel) {
            console.log("Could not find channel", channelId);
            return;
        }

        console.log("Sending to channel", channelId, channel.type);

        return (channel as TextChannel).send(message);
    } catch (e) {
        console.log("Error sending to channel", channelId, e);
    }
};
