import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, MessageReaction, User } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { eq, and, isNull, desc, sql, isNotNull, ilike } from "drizzle-orm";
import { db } from "@/db/db";
import { sendToChannelId } from "@/features/discord/discord";
import { Bet, Gambler, Summoner, bet, gambler, rank, summoner } from "../db/schema";
import { getMyBetsMessageEmbed } from "@/features/discord/messages";
import { getSummonerCurrentGame } from "@/features/summoner";
import { groupBy } from "pastable";
import { addMinutes, isSameDay } from "date-fns";
import { betDelayInMinutes } from "@/features/bets";

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
        console.log("bets are enabled");
        if (interaction.member.user.bot)
            return sendErrorToChannelId(interaction.channelId, "Bots can't bet", interaction);

        console.log("not a bot");
        if (points < 1) return sendErrorToChannelId(interaction.channelId, "Tu te crois où ?", interaction);
        console.log("points > 1");
        const currentGambler = await getOrCreateGambler(interaction);

        if (currentGambler.points < points)
            return sendErrorToChannelId(
                interaction.channelId,
                `You don't have enough points (current: ${currentGambler.points})`,
                interaction
            );
        console.log("enough points");

        const s = await db
            .select()
            .from(summoner)
            .where(ilike(summoner.currentName, name))
            .leftJoin(rank, eq(rank.summonerId, summoner.puuid))
            .limit(1);

        if (!s?.[0]) {
            const summoners = await db.select().from(summoner).where(eq(summoner.channelId, interaction.channelId));
            return sendErrorToChannelId(
                interaction.channelId,
                `Summoner not found, you must add it using '/addsummoner <summoner name>' first\n**Available summoners:**\n${summoners
                    .map((s) => s.currentName)
                    .join("\n")}`,
                interaction
            );
        }
        console.log("summoner found");
        const { summoner: currentSummoner } = s[0];

        if (!currentSummoner.isActive)
            return sendErrorToChannelId(
                interaction.channelId,
                `Summoner is not active, you must add it using '/addsummoner <summoner name>' first`,
                interaction
            );

        const existingBet = await db
            .select()
            .from(bet)
            .where(
                and(
                    and(eq(bet.gamblerId, currentGambler.id), eq(bet.summonerId, currentSummoner.puuid)),
                    isNull(bet.endedAt)
                )
            )
            .limit(1);

        if (existingBet?.[0])
            return sendErrorToChannelId(
                interaction.channelId,
                `You already have a bet on ${currentSummoner.currentName}`,
                interaction
            );

        await interaction.deferReply();
        console.log("deferred reply");

        const currentGame = await getSummonerCurrentGame(currentSummoner.id);
        console.log(currentSummoner.id);
        console.log("current game", !!currentGame);
        if (currentGame && addMinutes(new Date(currentGame.gameStartTime), betDelayInMinutes) > new Date()) {
            const shouldCreateBet = await sendBetConfirmation({ summ: currentSummoner, points, win, interaction });
            if (!shouldCreateBet) return interaction.editReply("Bet cancelled");
        }

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

        console.log("bet created");

        await interaction.editReply(
            `Bet placed by **${interaction.member.user.username}** on **${currentSummoner.currentName}** ${
                win ? "winning" : "losing"
            } next game (${points} points)`
        );
    }

    @Slash({ name: "mybets", description: "List all your bets" })
    async listMyBets(interaction: CommandInteraction) {
        const betsWithSummoner = await db
            .select()
            .from(bet)
            .leftJoin(summoner, eq(bet.summonerId, summoner.puuid))
            .leftJoin(gambler, eq(bet.gamblerId, gambler.id))
            .where(
                and(
                    eq(gambler.discordId, interaction.member.user.id),
                    eq(gambler.channelId, interaction.channelId),
                    eq(bet.endedAt, null)
                )
            );

        if (!betsWithSummoner?.[0])
            return sendErrorToChannelId(interaction.channelId, "You don't have any bets", interaction);

        const embed = getMyBetsMessageEmbed(betsWithSummoner);

        interaction.reply({ embeds: [embed] });
    }

    @Slash({ name: "listbets", description: "List all active bets" })
    async listAllBets(interaction: CommandInteraction) {
        const bets = await getBetsByChannelIdGroupedBySummoner(interaction.channelId);

        if (!bets || Object.keys(bets).length === 0)
            return sendErrorToChannelId(interaction.channelId, "No active bets", interaction);

        const embed = new EmbedBuilder().setTitle("Active bets on this channel").setDescription(
            Object.entries(bets)
                .map(([name, bets]) => {
                    return `on **${name}**:\n${bets
                        .map((b) => `${b.bet.points} on ${b.bet.hasBetOnWin ? "win" : "lose"} (${b.gambler.name})`)
                        .join("\n")}`;
                })
                .join("\n\n")
        );

        interaction.reply({ embeds: [embed] });
    }

    @Slash({ name: "pointsleaderboard", description: "Points leaderboard" })
    async pointsLeaderboard(interaction: CommandInteraction) {
        console.log("points leaderboard");
        const leaderboard = await getLeaderBoard(interaction.channelId);

        if (!leaderboard || leaderboard.length === 0)
            return sendErrorToChannelId(interaction.channelId, "No gambler in this channel", interaction);

        const embed = new EmbedBuilder()
            .setTitle("Points leaderboard")
            .setDescription(leaderboard.map((g) => `**${g.name}**: ${g.points} (${g.wins}/${g.losses})`).join("\n"));

        interaction.reply({ embeds: [embed] });
    }

    @Slash({ name: "beg", description: "Beg for points" })
    async beg(interaction: CommandInteraction) {
        const currentGambler = await getOrCreateGambler(interaction);

        if (currentGambler.points > 0)
            return sendErrorToChannelId(
                interaction.channelId,
                `You already have ${currentGambler.points} points`,
                interaction
            );

        const gamblerBets = await db
            .select()
            .from(bet)
            .where(and(eq(bet.gamblerId, currentGambler.id), isNull(bet.endedAt)))
            .limit(1);

        const hasActiveBets = gamblerBets?.[0];
        if (hasActiveBets)
            return sendErrorToChannelId(
                interaction.channelId,
                `You have ${gamblerBets[0].points} points in active bets`,
                interaction
            );

        const lastBeg = currentGambler.lastBeg;
        if (isSameDay(lastBeg, new Date()))
            return sendErrorToChannelId(interaction.channelId, `You already begged today`, interaction);

        await db.update(gambler).set({ points: 10, lastBeg: new Date() }).where(eq(gambler.id, currentGambler.id));

        const embed = new EmbedBuilder()
            .setColor(0xfbfaa6)
            .setDescription(`**${interaction.member.user.username}** begged and got 10 points`);

        interaction.reply({ embeds: [embed] });
    }
}

export const getLeaderBoard = async (channelId: string) => {
    const wins = db
        .select({
            gamblerId: bet.gamblerId,
            wins: sql<number>`SUM(CASE WHEN is_win = TRUE THEN 1 ELSE 0 END)`.as("wins"),
        })
        .from(bet)
        .groupBy(bet.gamblerId)
        .as("wins");

    const losses = db
        .select({
            gamblerId: bet.gamblerId,
            losses: sql<number>`SUM(CASE WHEN is_win = FALSE THEN 1 ELSE 0 END)`.as("losses"),
        })
        .from(bet)
        .groupBy(bet.gamblerId)
        .as("losses");

    return db
        .select({
            id: gambler.id,
            name: gambler.name,
            points: gambler.points,
            wins: wins.wins,
            losses: losses.losses,
        })
        .from(gambler)
        .orderBy(desc(gambler.points))
        .leftJoin(wins, eq(wins.gamblerId, gambler.id))
        .leftJoin(losses, eq(losses.gamblerId, gambler.id))
        .where(and(eq(gambler.channelId, channelId), and(isNotNull(wins.wins), isNotNull(losses.losses))));
};

export const getBetsByChannelIdGroupedBySummoner = async (channelId: string) => {
    const bets = await db
        .select()
        .from(bet)
        .leftJoin(summoner, eq(bet.summonerId, summoner.puuid))
        .leftJoin(gambler, eq(bet.gamblerId, gambler.id))
        .where(and(eq(summoner.channelId, channelId), isNull(bet.endedAt)));
    const bySummoners = groupBy(bets, (b) => b.summoner.currentName);

    return bySummoners as Record<string, { bet: Bet; summoner: Summoner; gambler: Gambler }[]>;
};

export const getOrCreateGambler = async (interaction: CommandInteraction) => {
    const { id, avatar } = interaction.member.user;

    const name = interaction.member.user.username;
    const channelId = interaction.channelId;

    const existing = await db
        .select()
        .from(gambler)
        .where(and(eq(gambler.discordId, id), eq(gambler.channelId, channelId)))
        .limit(1);
    if (existing?.[0]) {
        // if last claim was yesterday, give 500 points
        const lastClaim = existing[0].lastClaim;
        if (!isSameDay(lastClaim, new Date())) {
            await db
                .update(gambler)
                .set({ points: existing[0].points + 500, lastClaim: new Date() })
                .where(and(eq(gambler.discordId, id), eq(gambler.channelId, channelId)));
        }

        return (
            await db
                .select()
                .from(gambler)
                .where(and(eq(gambler.discordId, id), eq(gambler.channelId, channelId)))
                .limit(1)
        )?.[0];
    }

    await db.insert(gambler).values({ discordId: id, name, avatar, channelId });

    return (
        await db
            .select()
            .from(gambler)
            .where(and(eq(gambler.discordId, id), eq(gambler.channelId, channelId)))
            .limit(1)
    )[0];
};

export const sendErrorToChannelId = async (channelId: string, error: string, interaction?: CommandInteraction) => {
    console.error(error, channelId);
    const embed = new EmbedBuilder().setTitle("Error").setDescription(error).setColor(0xff0000);

    return interaction ? interaction.reply({ embeds: [embed] }) : sendToChannelId({ channelId, embed });
};

export const sendBetConfirmation = async ({
    summ,
    points,
    win,
    interaction,
}: {
    summ: Summoner;
    points: number;
    win: boolean;
    interaction: CommandInteraction;
}) => {
    const collectorFilter = (reaction: MessageReaction, user: User) => {
        return ["✅", "❌"].includes(reaction.emoji.name) && user.id === interaction.user.id;
    };

    const embed = new EmbedBuilder()
        .setTitle("Summoner in game")
        .setDescription(
            `You can't bet on ${summ.currentName} right now, but you can bet on the next game\n\n${points} points on ${
                summ.currentName
            } ${win ? "winning" : "losing"} next game ?`
        )
        .setColor(0xfbfaa6);
    const message = await interaction.channel.send({ embeds: [embed] });

    await Promise.all([message.react("✅"), message.react("❌")]);

    try {
        const collected = await message.awaitReactions({
            filter: collectorFilter,
            max: 1,
            time: 5000,
            errors: ["time"],
        });
        const reaction = collected.first();

        if (message.deletable) await message.delete();
        return reaction.emoji.name == "✅";
    } catch {
        if (message.deletable) await message.delete();
    } finally {
    }
};
