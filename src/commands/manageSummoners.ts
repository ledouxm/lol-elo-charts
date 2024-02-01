import { apex, rank, summoner } from "@/db/schema";
import { EmbedBuilder } from "@discordjs/builders";
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { desc, eq } from "drizzle-orm";
import { db } from "../db/db";
import { addSummoner, galeforce, getSummonerByName, removeSummoner } from "../features/summoner";
import { getInGameSummoners } from "@/features/activity";
import { getTotalLpFromRank, makeTierData } from "@/features/lol/lps";

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
            console.log("addSummoner", name);
            const riotSummoner = await getSummonerByName(name, tag || "EUW");

            await addSummoner(riotSummoner, interaction.channelId);
            interaction.reply("Added summoner " + name + "#" + tag || "EUW");
        } catch (e) {
            console.log(e);
            interaction.reply("Summoner not found");
        }
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
            .setDescription(summoners.length ? summoners.map((s) => s.currentName).join("\n") : "No summoner watched");

        interaction.reply({ embeds: [embed] });
    }

    @Slash({ name: "lpleaderboard", description: "Show the leaderboard of the channel" })
    async leaderboard(interaction: CommandInteraction) {
        const lastApex = await db.select().from(apex).orderBy(desc(apex.createdAt)).limit(1);

        const tierData = makeTierData(lastApex[0]);

        const summoners = await db.select().from(summoner).where(eq(summoner.channelId, interaction.channelId));

        const summonersWithRank = [];

        for (const summoner of summoners) {
            const summonerRank = await db
                .select()
                .from(rank)
                .where(eq(rank.summonerId, summoner.puuid))
                .orderBy(desc(rank.createdAt))
                .limit(1);

            console.log(summonerRank);

            if (summonerRank.length) {
                summonersWithRank.push({
                    summoner,
                    rank: summonerRank[0],
                    totalLp: getTotalLpFromRank(summonerRank[0], tierData),
                });
            }
        }

        const embed = new EmbedBuilder().setTitle("Channel leaderboard").setDescription(
            summonersWithRank.length
                ? summonersWithRank
                      .sort((a, b) => b.totalLp - a.totalLp)
                      .map(
                          (s, index) =>
                              `${index + 1}) ${s.summoner.currentName} - ${s.rank.tier} ${s.rank.division} ${
                                  s.rank.leaguePoints
                              } LP`
                      )
                      .join("\n")
                : "No summoner watched"
        );

        interaction.reply({ embeds: [embed] });
    }
    // @Slash({ name: "register", description: "Register yourself as gambler" })
    // async registerAsGamber(interaction: CommandInteraction) {
    //     const gamb = await getOrCreateGambler(interaction);

    //     interaction.reply("Test");
    // }

    @Slash({ name: "test", description: "List all summoners being tracked" })
    async test(interaction: CommandInteraction) {
        await getInGameSummoners();
        interaction.reply("ok");
    }
}
