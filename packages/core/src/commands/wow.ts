import { db } from "@/db/db";
import { wowCharacter } from "@/db/wowSchema";
import { getWowRecentRun } from "@/features/wow/wowStalker";
import {
    ApplicationCommandOptionType,
    Awaitable,
    ColorResolvable,
    CommandInteraction,
    EmbedBuilder,
    InteractionReplyOptions,
} from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { and, eq } from "drizzle-orm";

@Discord()
export class ManageWow {
    @Slash({ name: "add-player", description: "Stalk a player in this channel" })
    async addPlayer(
        @SlashChoice({ name: "EU", value: "eu" })
        @SlashChoice({ name: "US", value: "us" })
        @SlashChoice({ name: "KR", value: "kr" })
        @SlashChoice({ name: "TW", value: "tw" })
        @SlashChoice({ name: "CN", value: "cn" })
        @SlashOption({
            name: "region",
            description: "Region",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        region: string,
        @SlashOption({
            name: "name",
            description: "Character name",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        name: string,
        @SlashOption({
            name: "realm",
            description: "Character realm",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        realm: string,
        interaction: CommandInteraction
    ) {
        const result = await wowCommands.addPlayer({ region, name, realm, channelId: interaction.channelId });
        interaction.reply(result);
    }

    @Slash({ name: "remove-player", description: "Unstalk a player" })
    async removePlayer(
        @SlashChoice({ name: "EU", value: "eu" })
        @SlashChoice({ name: "US", value: "us" })
        @SlashChoice({ name: "KR", value: "kr" })
        @SlashChoice({ name: "TW", value: "tw" })
        @SlashChoice({ name: "CN", value: "cn" })
        @SlashOption({
            name: "region",
            description: "Region",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        region: string,
        @SlashOption({
            name: "name",
            description: "Character name",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        name: string,
        @SlashOption({
            name: "realm",
            description: "Character realm",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        realm: string,
        interaction: CommandInteraction
    ) {
        const result = await wowCommands.removePlayer({ region, name, realm, channelId: interaction.channelId });
        interaction.reply(result);
    }

    @Slash({ name: "list-players", description: "List the players stalked in this channel" })
    async listPlayers(interaction: CommandInteraction) {
        const result = await wowCommands.listPlayers({ channelId: interaction.channelId });
        interaction.reply(result);
    }
}

export const wowCommands: Record<string, (args: any) => Awaitable<InteractionReplyOptions>> = {
    addPlayer: async ({
        region,
        name,
        realm,
        channelId,
    }: {
        region: string;
        name: string;
        realm: string;
        channelId: string;
    }) => {
        const existing = (
            await db
                .select()
                .from(wowCharacter)
                .where(
                    and(
                        eq(wowCharacter.name, name),
                        eq(wowCharacter.realm, realm),
                        eq(wowCharacter.region, region),
                        eq(wowCharacter.channelId, channelId)
                    )
                )
        )?.[0];
        if (existing) return { content: "Character already exists" };

        const character = await getWowRecentRun({ region, realm, name, channelId });

        const characterAddedEmbed = new EmbedBuilder()
            .setTitle("Character added")
            .setDescription(character.name)
            .setImage(character.thumbnail_url)
            .setColor(classColors[character.class as Class]);

        return { embeds: [characterAddedEmbed] };
    },
    removePlayer: async ({
        region,
        name,
        realm,
        channelId,
    }: {
        region: string;
        name: string;
        realm: string;
        channelId: string;
    }) => {
        const existing = (
            await db
                .select()
                .from(wowCharacter)
                .where(
                    and(
                        eq(wowCharacter.name, name),
                        eq(wowCharacter.realm, realm),
                        eq(wowCharacter.region, region),
                        eq(wowCharacter.channelId, channelId)
                    )
                )
        )?.[0];
        if (!existing) return { content: "Character not found" };

        await db.delete(wowCharacter).where(eq(wowCharacter.id, existing.id)).execute();

        const characterRemovedEmbed = new EmbedBuilder().setTitle("Character removed").setDescription(existing.name);

        return { embeds: [characterRemovedEmbed] };
    },
    listPlayers: async ({ channelId }) => {
        const characters = await db.select().from(wowCharacter).where(eq(wowCharacter.channelId, channelId));

        if (!characters.length) return { content: "No character stalked" };

        const getDescription = () => {
            return characters.map((c) => `${c.name} - ${c.realm}`).join("\n");
        };

        const embed = new EmbedBuilder().setTitle("WoW stalked characters").setDescription(getDescription());

        return { embeds: [embed] };
    },
};

const classColors: Record<Class, ColorResolvable> = {
    Hunter: "#ABD473",
    Warrior: "#C79C6E",
    Mage: "#69CCF0",
    Priest: "#FFFFFF",
    Rogue: "#FFF569",
    Shaman: "#0070DE",
    Warlock: "#9482C9",
    Paladin: "#F58CBA",
    Druid: "#FF7D0A",
    "Death Knight": "#C41F3B",
    Monk: "#00FF96",
    "Demon Hunter": "#A330C9",
};

type Class =
    | "Hunter"
    | "Warrior"
    | "Mage"
    | "Priest"
    | "Rogue"
    | "Shaman"
    | "Warlock"
    | "Paladin"
    | "Druid"
    | "Death Knight"
    | "Monk"
    | "Demon Hunter";
