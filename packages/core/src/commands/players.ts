import { ApplicationCommandOptionType, Awaitable, CommandInteraction, InteractionReplyOptions } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { lolConfig } from "./lol";
import { valorantConfig } from "./valorant";

@Discord()
export class ManagePlayers {
    @Slash({ name: "add-player", description: "Stalk a player in this channel" })
    async addPlayer(
        @SlashChoice({ name: "LoL", value: "lol" })
        @SlashChoice({ name: "Valorant", value: "valorant" })
        @SlashOption({
            name: "game",
            description: "Game to stalk the player on",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        game: Game,
        @SlashOption({
            name: "name",
            description: "Player name with tag (e.g. name#tag)",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        name: string,
        interaction: CommandInteraction
    ) {
        const [gameName, tag] = name.split("#");
        await gameConfigs[game].addPlayer({ name: gameName, tag, channelId: interaction.channelId });
        interaction.reply(`Player ${name} added to ${game} stalk list`);
    }

    @Slash({ name: "remove-player", description: "Unstalk a player" })
    async removePlayer(
        @SlashChoice({ name: "LoL", value: "lol" })
        @SlashChoice({ name: "Valorant", value: "valorant" })
        @SlashOption({
            name: "game",
            description: "Game to unstalk the player from",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        game: Game,
        @SlashOption({
            name: "name",
            description: "Player name with tag (e.g. name#tag)",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        name: string,
        interaction: CommandInteraction
    ) {
        const [gameName, tag] = name.split("#");
        await gameConfigs[game].removePlayer({ name: gameName, tag, channelId: interaction.channelId });
        interaction.reply("Player removed");
    }

    @Slash({ name: "list-players", description: "List the players stalked in this channel" })
    async listPlayers(
        @SlashChoice({ name: "LoL", value: "lol" })
        @SlashChoice({ name: "Valorant", value: "valorant" })
        @SlashOption({
            name: "game",
            description: "Game to list the players for",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        game: Game | undefined,
        interaction: CommandInteraction
    ) {
        const message = await gameConfigs[game].listPlayers({ channelId: interaction.channelId });
        interaction.reply(message);
    }

    @Slash({ name: "leaderboard", description: "Show the players leaderboard" })
    async leaderboard(
        @SlashChoice({ name: "LoL", value: "lol" })
        @SlashChoice({ name: "Valorant", value: "valorant" })
        @SlashOption({
            name: "game",
            description: "Game to list the players for",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        game: Game,
        interaction: CommandInteraction
    ) {
        const message = await gameConfigs[game].leaderboard({ channelId: interaction.channelId });
        interaction.reply(message);
    }
}

const gameConfigs: Record<Game, GameConfig> = {
    lol: lolConfig,
    valorant: valorantConfig,
};

export interface GameConfig {
    addPlayer: ({ name, tag, channelId }: { name: string; tag: string; channelId: string }) => Awaitable<void>;
    removePlayer: ({ name, tag, channelId }: { name: string; tag: string; channelId: string }) => Awaitable<void>;
    leaderboard: ({ channelId }: { channelId: string }) => Awaitable<InteractionReplyOptions>;
    listPlayers: ({ channelId }: { channelId: string }) => Awaitable<InteractionReplyOptions>;
}

type Game = "lol" | "valorant";
