import { ApplicationCommandOptionType, Awaitable, CommandInteraction, InteractionReplyOptions } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { lolConfig } from "./lol";
import { valorantConfig } from "./valorant";
import { getSummonersWithChannels } from "@/features/stalker/lol/summoner";
import { db } from "@/db/db";
import { arenaMatch, arenaPlayer, summoner } from "@/db/schema";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { sendToChannelId } from "@/features/discord/discord";
import { EmbedBuilder } from "@discordjs/builders";
import { getChampionAndSpellIconStaticData } from "@/features/lol/icons";
import Galeforce from "galeforce";
import { getSummonerByName } from "@/features/summoner";
import { ENV } from "@/envVars";
import { groupBy } from "pastable";

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
        @SlashChoice({ name: "Arena", value: "arena" })
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

    @Slash({ name: "arena", description: "Show the progress of the Arena god challenge" })
    async arena(
        @SlashOption({
            name: "name",
            description: "Summoner#TAG",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        name,
        interaction: CommandInteraction
    ) {
        if (!ENV.ARENA_COMMANDS_ENABLED) return interaction.reply({ content: "Arena commands are disabled" });
        // const [gameName, tag] = name.split("#");
        const { champion } = await getChampionAndSpellIconStaticData();
        const summs = await db.select().from(summoner).where(eq(summoner.currentName, name)).limit(1);
        const summ = summs[0];
        if (!summ) {
            interaction.reply("Summoner not found");
            return;
        }

        const championsWin = await db
            .select({
                champion: arenaPlayer.champion,
                matchId: arenaMatch.matchId,
            })
            .from(arenaPlayer)
            .leftJoin(arenaMatch, eq(arenaPlayer.matchId, arenaMatch.matchId))
            .where(
                and(
                    eq(arenaPlayer.puuid, summ.puuid),
                    eq(arenaPlayer.placement, 1),
                    gte(arenaMatch.endedAt, new Date("2025-01-01"))
                )
            );

        const sortedByChampion = groupBy(championsWin, (c) => c.champion);

        const entries = Object.entries(sortedByChampion);

        interaction.reply({
            content: `## Arena god progress for ${name}
${"### Done " + "(" + (entries.length ?? 0) + "/" + Object.keys(champion).length + ")"}
${entries
    .map(([name, c]) => name + ` (x${c.length})`)
    .sort()
    .join("\n")}
`,
        });
    }
}

const gameConfigs: Record<Game, GameConfig> = {
    lol: lolConfig,
    arena: {
        leaderboard: async ({ channelId }) => {
            if (!ENV.ARENA_COMMANDS_ENABLED) return { content: "Arena commands are disabled" };

            const summoners = await getSummonersWithChannels(channelId);
            const puuidArray = summoners.map((s) => s.puuid);
            const top1 = await db
                .select({
                    puuid: arenaPlayer.puuid,
                    wins: sql`count(*)`.mapWith(Number),
                })
                .from(arenaPlayer)
                .where(and(inArray(arenaPlayer.puuid, puuidArray), eq(arenaPlayer.placement, 1)))
                .groupBy(arenaPlayer.puuid);

            const totalGames = await db
                .select({
                    puuid: arenaPlayer.puuid,
                    games: sql`count(*)`.mapWith(Number),
                })
                .from(arenaPlayer)
                .where(inArray(arenaPlayer.puuid, puuidArray))
                .groupBy(arenaPlayer.puuid);

            const embed = new EmbedBuilder();
            embed.setTitle("Arena leaderboard");

            embed.addFields(
                summoners
                    .map((summ) => {
                        const p = totalGames.find((t) => t.puuid === summ.puuid);
                        if (!p) return null;
                        const wins = top1.find((t) => t.puuid === p.puuid)?.wins || 0;

                        return {
                            name: summ.currentName,
                            value: `**${wins}** ${stringWithPlural("win", wins)} / **${p.games}** ${stringWithPlural(
                                "game",
                                p.games
                            )}`,
                            wins,
                        };
                    })
                    .filter(Boolean)
                    .sort((a, b) => b.wins - a.wins)
            );

            return {
                embeds: [embed],
            };
        },
    } as any,
    valorant: valorantConfig,
};

const stringWithPlural = (str: string, items: number) => `${str}${items > 1 ? "s" : ""}`;

export interface GameConfig {
    addPlayer: ({ name, tag, channelId }: { name: string; tag: string; channelId: string }) => Awaitable<void>;
    removePlayer: ({ name, tag, channelId }: { name: string; tag: string; channelId: string }) => Awaitable<void>;
    leaderboard: ({ channelId }: { channelId: string }) => Awaitable<InteractionReplyOptions>;
    listPlayers: ({ channelId }: { channelId: string }) => Awaitable<InteractionReplyOptions>;
}

type Game = "lol" | "valorant" | "arena";
