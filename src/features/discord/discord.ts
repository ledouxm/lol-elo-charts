import type { AttachmentBuilder, EmbedBuilder, Interaction, Message, TextChannel } from "discord.js";
import { IntentsBitField } from "discord.js";
import { Client } from "discordx";
import "../../commands/bets";
import "../../commands/manageSummoners";

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
    // The following syntax should be used in the ECMAScript environment
    // Let's start the bot
    if (!process.env.BOT_TOKEN) {
        throw Error("Could not find BOT_TOKEN in your environment");
    }

    // Log in with your bot token
    await bot.login(process.env.BOT_TOKEN);
};

export const sendToChannelId = async ({
    channelId,
    embed,
    file,
    content,
    retry = true,
}: {
    channelId: string;
    embed?: EmbedBuilder | string;
    file?: AttachmentBuilder | Buffer;
    retry?: boolean;
    content?: string;
}) => {
    try {
        const channel = bot.channels.cache.get(channelId);
        if (!channel) {
            console.log("Could not find channel", channelId);
            if (retry) {
                await bot.channels.fetch(channelId, { cache: true, force: true });
                await sendToChannelId({ channelId, embed, file, content });
            }
            return;
        }

        console.log("Sending to channel", channelId, channel.type);

        if (typeof embed === "string") {
            await (channel as TextChannel).send(embed);
            return;
        }

        await (channel as TextChannel).send({
            embeds: embed ? [embed] : undefined,
            files: file ? [file] : undefined,
            content,
        });
    } catch (e) {
        console.log("Error sending to channel", channelId, e);
    }
};
