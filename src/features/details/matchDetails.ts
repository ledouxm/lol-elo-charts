import Galeforce from "galeforce";
import { Participant, getDamageDealtPercent, getKillParticipation } from "../summoner";
import { groupBy, sortArrayOfObjectByPropFromArray, sortBy } from "pastable";
import { createCanvas, loadImage, type CanvasRenderingContext2D } from "canvas";
import { DDImageLoader, getChampionIconUrl, getItemIconImageData, getSummonerSpellIconImageData } from "../lol/icons";
import fs from "fs/promises";
import { DataDragon } from "data-dragon";

const imageLoader = new DDImageLoader();

const options = {
    championIconSize: 48,
    championIconSpacing: 10,
    championIconY: 55,
    championIconX: 10,
    summonerSpellIconSize: 24,
    itemIconSize: 36,
    itemIconSpacing: 10,
    kdaFontSize: 20,
    kdaSmallFontSize: 16,
    kdaSpacing: 10,
    kdaInnerSpacing: 5,
};

export const createMatchDetails = async (match: Galeforce.dto.MatchDTO, participant: Participant) => {
    const dragon = await DataDragon.latest();
    await dragon.items.fetch();

    const sortedPlayers = sortPlayersByTeamAndRole(match.info.participants);
    const blueSidePlayers = sortedPlayers[blueSide];
    const redSidePlayers = sortedPlayers[redSide];

    const canvas = createCanvas(800, 467);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 800, 600);

    const { x, y, width, height } = getRectArguments(participant, blueSidePlayers, redSidePlayers);
    ctx.strokeStyle = "#FDB05F";
    ctx.lineWidth = 4;
    ctx.strokeRect(
        x - ctx.lineWidth / 2 - 1,
        y - ctx.lineWidth / 2 - 1,
        width + ctx.lineWidth + 4,
        height + ctx.lineWidth + 4
    );

    for (const [index, player] of blueSidePlayers.entries()) {
        const leftX = options.championIconX;
        const topY = getTopY(index);

        await drawChampionIcons({ ctx, participant: player, x: leftX, y: topY });

        const itemX = leftX + options.championIconSize + options.itemIconSpacing;
        const itemY = topY + options.championIconSize + options.summonerSpellIconSize - options.itemIconSize;
        await drawItems({
            ctx,
            items: [player.item0, player.item1, player.item2, player.item3, player.item4, player.item5, player.item6],
            x: itemX,
            y: itemY,
        });

        const kdaX = leftX + options.championIconSize + options.kdaSpacing;
        const kdaY = topY + options.kdaFontSize + options.itemIconSize / 6;

        const csX = (await drawKDA({ ctx, participant: player, x: kdaX, y: kdaY })) + options.kdaSpacing;
        await drawCreepScore({ ctx, participant: player, x: csX, y: kdaY });
    }

    for (const [index, player] of redSidePlayers.entries()) {
        const leftX = 800 - options.championIconX - options.championIconSize;
        const topY = getTopY(index);

        await drawChampionIcons({ ctx, participant: player, x: leftX, y: topY });

        const itemX = leftX - options.itemIconSize * 7 - options.itemIconSpacing;
        const itemY = topY + options.championIconSize + options.summonerSpellIconSize - options.itemIconSize;
        await drawItems({
            ctx,
            items: [
                player.item0,
                player.item1,
                player.item2,
                player.item3,
                player.item4,
                player.item5,
                player.item6,
            ].reverse(),
            x: itemX,
            y: itemY,
        });

        ctx.font = `${options.kdaFontSize}px Arial`;
        const kda = `${player.kills}/${player.deaths}/${player.assists}`;
        const kdaWidth = ctx.measureText(kda).width + 4 * options.kdaInnerSpacing;

        const kdaX = leftX - options.kdaSpacing - kdaWidth;
        const kdaY = topY + options.kdaFontSize + options.itemIconSize / 6;
        await drawKDA({ ctx, participant: player, x: kdaX, y: kdaY });

        ctx.font = `${options.kdaSmallFontSize}px Arial`;
        const creepScore = `${player.totalMinionsKilled}cs`;
        const csWidth = ctx.measureText(creepScore).width + options.kdaSpacing;

        const csX = kdaX - csWidth;
        await drawCreepScore({ ctx, participant: player, x: csX, y: kdaY });
    }

    await drawWinLoss({
        ctx,
        match,
        y: 38,
        blueSizeX: 10,
        redSizeX: 800 - 10,
    });

    const buffer = canvas.toBuffer("image/png");
    await fs.writeFile("matchDetails.png", buffer);
};

const drawWinLoss = async ({
    ctx,
    match,
    y,
    blueSizeX,
    redSizeX,
}: {
    ctx: CanvasRenderingContext2D;
    match: Galeforce.dto.MatchDTO;
    y: number;
    blueSizeX: number;
    redSizeX: number;
}) => {
    const hasBlueSideWon = match.info.teams[0].win;

    ctx.font = "32px Arial";
    ctx.fillStyle = hasBlueSideWon ? "#2DEB90" : "#ff5859";
    ctx.fillText(hasBlueSideWon ? "Victory" : "Defeat", blueSizeX, y);

    ctx.font = "32px Arial";
    ctx.fillStyle = hasBlueSideWon ? "#ff5859" : "#2DEB90";
    const text = hasBlueSideWon ? "Defeat" : "Victory";
    const width = ctx.measureText(text).width;
    ctx.fillText(text, redSizeX - width, y);
};

const drawChampionIcons = async ({
    ctx,
    participant,
    x,
    y,
}: {
    ctx: CanvasRenderingContext2D;
    participant: Participant;
    x: number;
    y: number;
}) => {
    const icon = await imageLoader.loadImage(await getChampionIconUrl(participant.championName));
    ctx.drawImage(icon, x, y, options.championIconSize, options.championIconSize);

    const spell1ImageData = await getSummonerSpellIconImageData(participant.summoner1Id);
    await imageLoader.drawSprite(
        ctx,
        spell1ImageData,
        x,
        y + options.championIconSize,
        options.summonerSpellIconSize,
        options.summonerSpellIconSize
    );

    const spell2ImageData = await getSummonerSpellIconImageData(participant.summoner2Id);
    await imageLoader.drawSprite(
        ctx,
        spell2ImageData,
        x + options.summonerSpellIconSize,
        y + options.championIconSize,
        options.summonerSpellIconSize,
        options.summonerSpellIconSize
    );
};

const drawItems = async ({
    ctx,
    items,
    x,
    y,
}: {
    ctx: CanvasRenderingContext2D;
    items: number[];
    x: number;
    y: number;
}) => {
    for (const [i, itemId] of items.entries()) {
        const itemImageData = await getItemIconImageData(itemId);
        await imageLoader.drawSprite(
            ctx,
            itemImageData,
            x + i * options.itemIconSize,
            y,
            options.itemIconSize,
            options.itemIconSize
        );
    }
};

const drawKDA = async ({
    ctx,
    participant,
    x,
    y,
}: {
    ctx: CanvasRenderingContext2D;
    participant: Participant;
    x: number;
    y: number;
}) => {
    let currentX = x;
    ctx.font = `${options.kdaFontSize}px Arial`;

    ctx.fillStyle = "#2DEB90";
    ctx.fillText(participant.kills.toString(), currentX, y);
    currentX += ctx.measureText(participant.kills.toString()).width + options.kdaInnerSpacing;

    ctx.fillStyle = "#787878";
    ctx.fillText("/", currentX, y);
    currentX += ctx.measureText("/").width + options.kdaInnerSpacing;

    ctx.fillStyle = "#ff5859";
    ctx.fillText(participant.deaths.toString(), currentX, y);
    currentX += ctx.measureText(participant.deaths.toString()).width + options.kdaInnerSpacing;

    ctx.fillStyle = "#787878";
    ctx.fillText("/", currentX, y);
    currentX += ctx.measureText("/").width + options.kdaInnerSpacing;

    ctx.fillStyle = "#FDB05F";
    ctx.fillText(participant.assists.toString(), currentX, y);
    currentX += ctx.measureText(participant.assists.toString()).width;

    return currentX;
};

const drawCreepScore = async ({
    ctx,
    participant,
    x,
    y,
}: {
    ctx: CanvasRenderingContext2D;
    participant: Participant;
    x: number;
    y: number;
}) => {
    ctx.font = `${options.kdaSmallFontSize}px Arial`;
    ctx.fillStyle = "#787878";
    ctx.fillText(participant.totalMinionsKilled.toString() + "cs", x, y);
};

const sortPlayersByTeamAndRole = (players: Participant[]) => {
    const sortedByRole = sortArrayOfObjectByPropFromArray(players, "teamPosition", roleOrder);
    const sortedByTeam = groupBy(sortedByRole, "teamId");

    return sortedByTeam as Record<AnySide, Participant[]>;
};

const getRectArguments = (participant: Participant, blueSidePlayers: Participant[], redSidePlayers: Participant[]) => {
    const blueSideIndex = blueSidePlayers.findIndex((p) => p.puuid === participant.puuid);
    const redSideIndex = redSidePlayers.findIndex((p) => p.puuid === participant.puuid);

    const isBlueSide = blueSideIndex !== -1;
    const index = isBlueSide ? blueSideIndex : redSideIndex;

    const width = options.championIconSize + options.itemIconSpacing + 7 * options.itemIconSize;
    const height = options.championIconSize + options.summonerSpellIconSize;

    const leftX = isBlueSide ? options.championIconX : 800 - options.championIconX - width;
    const topY = getTopY(index);

    return { x: leftX, y: topY, width, height };
};

const getTopY = (index: number) => {
    return (
        options.championIconY +
        index * (options.championIconSize + options.championIconSpacing + options.summonerSpellIconSize)
    );
};

const roleOrder = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
const blueSide = 100 as const;
const redSide = 200 as const;

type AnySide = typeof blueSide | typeof redSide;
