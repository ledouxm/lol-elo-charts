import { db } from "@/db/db";
import { ArenaPlayer, Summoner, arenaMatch, arenaPlayer, match, summoner } from "@/db/schema";
import { getChampionIconUrl } from "@/features/lol/icons";
import Galeforce from "galeforce";
import { SummonerWithChannels, getSummonersWithChannels } from "./summoner";
import { galeforce } from "@/features/summoner";
import { eq, inArray } from "drizzle-orm";
import { EmbedBuilder } from "@discordjs/builders";
import { groupBy } from "pastable";
import { sendToChannelId } from "@/features/discord/discord";
import { ENV } from "@/envVars";
import { MatchDTO } from "galeforce/dist/galeforce/interfaces/dto";

export const getMatchInformationsForSummoner = async (summ: Summoner, match: Galeforce.dto.MatchDTO) => {
    const participantIndex = match.info.participants.findIndex((p) => p.puuid === summ.puuid);
    const participant: Participant = match.info.participants[participantIndex];

    const championIconUrl = await getChampionIconUrl(participant.championName);
    const team = match.info.teams.find((t) => t.teamId === participant.teamId);

    return {
        participant,
        team,
        participantIndex,
        championIconUrl,
    } as {
        participant: Participant;
        team: Team;
        championIconUrl: string;
        participantIndex: number;
    };
};

export const getLastGameId = async (summoner: Summoner) => {
    const lastGames = await galeforce.lol.match
        .list()
        .region(galeforce.region.riot.EUROPE)
        .puuid(summoner.puuid)
        .query({ count: 1, queue: [420, 1700] as any })
        .exec();

    return lastGames?.[0];
};

export const getExistingGameById = async (gameId: string) => {
    const existingGames = await db.select().from(match).where(eq(match.matchId, gameId)).limit(1);

    return existingGames?.[0];
};

export const getGameById = async (gameId: string) => {
    const lastGame = await galeforce.lol.match.match().region(galeforce.region.riot.EUROPE).matchId(gameId).exec();

    return lastGame;
};

export const getLastGameAndStoreIfNecessary = async (summoner: Summoner) => {
    const lastGameId = await getLastGameId(summoner);
    if (!lastGameId) return null;

    const existingGame = await getExistingGameById(lastGameId);
    if (existingGame) return existingGame.details;

    const lastGame = await getGameById(lastGameId);
    if (await checkIfGameIsArenaAndStore(lastGameId, lastGame)) return null;

    await storeLoLMatch({ player: summoner, lastMatch: lastGame });

    return lastGame;
};

type HasAlreadyWritten = boolean;

const checkIfGameIsArenaAndStore = async (lastGameId: string, lastGame: MatchDTO): Promise<HasAlreadyWritten> => {
    if (!ENV.ARENA_ENABLED) return false;

    const existing = await db.select().from(arenaMatch).where(eq(arenaMatch.matchId, lastGameId)).limit(1);
    if (existing[0]) return true;

    if (!lastGame) return false;

    if (lastGame.info.queueId !== 1700) return false;

    await db.insert(arenaMatch).values({
        matchId: lastGameId,
        endedAt: new Date(lastGame.info.gameEndTimestamp),
    });

    const players = await db
        .insert(arenaPlayer)
        .values(
            lastGame.info.participants.map((p) => ({
                puuid: p.puuid,
                placement: p.placement,
                name: `${p.riotIdGameName}#${p.riotIdTagline}`,
                champion: p.championName,
                matchId: lastGameId,
            }))
        )
        .returning();

    if (ENV.ARENA_NOTIFICATION_ENABLED) {
        await sendArenaDiscordNotification(players);
    }

    return true;
};

const sendArenaDiscordNotification = async (players: ArenaPlayer[]) => {
    const matchingSummoners = await db
        .select()
        .from(summoner)
        .where(
            inArray(
                summoner.puuid,
                players.map((p) => p.puuid)
            )
        );
    const groupedByChannel = groupBy(matchingSummoners, (s) => s.channelId);

    for (const [channelId, summ] of Object.entries(groupedByChannel)) {
        const arenaPlayers = summ.map((s) => players.find((p) => p.puuid === s.puuid));

        const embed = getArenaEmbed(arenaPlayers);

        await sendToChannelId({ channelId, message: { embeds: [embed] } });
    }
};

const getArenaEmbed = (players: ArenaPlayer[]) => {
    const embed = new EmbedBuilder();
    embed.setTitle("Arena game results");
    embed.setURL("https://www.leagueofgraphs.com/match/euw/" + players[0].matchId.split("_")[1]);

    const emojiMap = { 1: "🏆", 2: "🥈", 3: "🥉" };

    players
        .sort((a, b) => a.placement - b.placement)
        .forEach(({ name, placement, champion }) => {
            const emoji = emojiMap[placement] || "";
            embed.addFields({
                name: `${emoji} ${name}`,
                value: `Top **${placement}** with **${champion}**`,
            });
        });

    return embed;
};

export const storeLoLMatch = async ({ player, lastMatch }: { player: Summoner; lastMatch: Galeforce.dto.MatchDTO }) => {
    const participantIndex = lastMatch.info.participants.findIndex((p) => p.puuid === player.puuid);
    const participant: Participant = lastMatch.info.participants[participantIndex];

    const isWin = participant.win;
    const kda = `${participant.kills}/${participant.deaths}/${participant.assists}`;

    return db.insert(match).values({
        startedAt: new Date(lastMatch.info.gameStartTimestamp),
        matchId: lastMatch.metadata.matchId,
        endedAt: new Date(lastMatch.info.gameEndTimestamp),
        isWin,
        kda,
        participantIndex,
        championName: participant.championName,
        summonerId: player.puuid,
        details: lastMatch,
    });
};

export const persistLastGameId = async (player: Summoner, gameId: string) => {
    await db.update(summoner).set({ lastGameId: gameId }).where(eq(summoner.puuid, player.puuid));
};

export type Participant = Galeforce.dto.MatchDTO["info"]["participants"][0];
export type Team = Galeforce.dto.MatchDTO["info"]["teams"][0];
