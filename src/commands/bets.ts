import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { eq } from "drizzle-orm";
import { db } from "src/db/db";
import { sendToChannelId } from "src/discord";
import { bet, gambler, rank, summoner } from "../db/schema";
import * as DateFns from "date-fns";

@Discord()
export class Bets {
    @Slash({ name: "bet", description: "Bet on a summoner's next game" })
    async placeBet(
        @SlashOption({
            description: "Bet amount",
            name: "points",
            required: true,
            type: ApplicationCommandOptionType.Integer,
        })
        points: number,
        @SlashOption({
            description: "Summoner name",
            name: "name",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        name: string,
        @SlashOption({
            description: "Will win ?",
            name: "win",
            required: true,
            type: ApplicationCommandOptionType.Boolean,
        })
        win: boolean,
        interaction: CommandInteraction
    ) {
        if (!process.env.ENABLE_BETS) {
            return sendErrorToChannelId(
                interaction.channelId,
                "Bets are disabled, contact the owner of the bot to enable them",
                interaction
            );
        }

        if (interaction.member.user.bot)
            return sendErrorToChannelId(interaction.channelId, "Bots can't bet", interaction);

        if (points < 1) return sendErrorToChannelId(interaction.channelId, "Tu te crois où ?", interaction);

        const currentGambler = await getOrCreateGambler(interaction);

        if (currentGambler.points < points)
            return sendErrorToChannelId(
                interaction.channelId,
                `You don't have enough points (current: ${currentGambler.points})`,
                interaction
            );

        const s = await db
            .select()
            .from(summoner)
            .where(eq(summoner.currentName, name))
            .leftJoin(rank, eq(rank.summonerId, summoner.puuid))
            .limit(1);

        if (!s?.[0])
            return sendErrorToChannelId(
                interaction.channelId,
                "Summoner not found, you must add it using '/addsummoner <summoner name>' first",
                interaction
            );

        if (!s[0].rank)
            return sendErrorToChannelId(
                interaction.channelId,
                "Summoner has no rank yet, wait for the next update",
                interaction
            );

        const { summoner: currentSummoner } = s[0];

        await db
            .update(gambler)
            .set({ points: currentGambler.points - points })
            .where(eq(gambler.id, currentGambler.id));
        // create bet
        await db.insert(bet).values({
            points,
            gamblerId: currentGambler.id,
            hasBetOnWin: win,
            summonerId: currentSummoner.puuid,
        });

        interaction.reply(
            `Bet placed by ${interaction.member.user.username} on ${currentSummoner.currentName} ${
                win ? "winning" : "losing"
            } next game`
        );
    }

    @Slash({ name: "mybets", description: "List all your bets" })
    async listBets(interaction: CommandInteraction) {
        const betsWithSummoner = await db
            .select()
            .from(bet)
            .where(eq(bet.gamblerId, interaction.member.user.id))
            .leftJoin(summoner, eq(bet.summonerId, summoner.puuid));

        if (!betsWithSummoner?.[0])
            return sendErrorToChannelId(interaction.channelId, "You don't have any bets", interaction);

        const embed = new EmbedBuilder()
            .setTitle("Your bets")
            .setDescription(
                betsWithSummoner
                    .map(
                        ({ bet, summoner }) =>
                            bet.points + " on " + summoner.currentName + " to " + (bet.hasBetOnWin ? "win" : "lose")
                    )
                    .join("\n")
            );

        interaction.reply({ embeds: [embed] });
    }

    @Slash({ name: "claim", description: "Claim your daily points" })
    async claim(interaction: CommandInteraction) {
        const gamb = await getOrCreateGambler(interaction);
        if (gamb.lastClaim && DateFns.differenceInHours(new Date(), gamb.lastClaim) < 24) {
            return sendErrorToChannelId(
                interaction.channelId,
                "You already claimed your daily points, come back tomorrow",
                interaction
            );
        }

        await db
            .update(gambler)
            .set({ points: gamb.points + 500, lastClaim: new Date() })
            .where(eq(gambler.id, gamb.id));

        interaction.reply(`500 points claimed (${gamb.points + 500})`);
    }
}

export const getOrCreateGambler = async (interaction: CommandInteraction) => {
    const { id, avatar } = interaction.member.user;

    const name = interaction.member.user.username;
    const channelId = interaction.channelId;

    const existing = await db.select().from(gambler).where(eq(gambler.id, id)).limit(1);
    if (existing?.[0]) return existing[0];

    await db.insert(gambler).values({ id, name, avatar, channelId });

    return (await db.select().from(gambler).where(eq(gambler.id, id)).limit(1))[0];
};

export const sendErrorToChannelId = async (channelId: string, error: string, interaction?: CommandInteraction) => {
    console.error(error, channelId);
    const embed = new EmbedBuilder().setTitle("Error").setDescription(error).setColor(0xff0000);

    return interaction ? interaction.reply({ embeds: [embed] }) : sendToChannelId(channelId, embed);
};
