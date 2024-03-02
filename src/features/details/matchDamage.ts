import Galeforce from "galeforce";
import { Participant } from "../summoner";
import { createCanvas } from "canvas";
import { blueSide, redSide, sortPlayersByTeamAndRole } from "./matchDetails";
import { DDImageLoader, getChampionIconUrl } from "../lol/icons";
import fs from "fs/promises";

const options = {
    championIconSize: 48,
    championIconSpace: 5,
    padding: 10,
    damageMargin: 4,
};

const imageLoader = new DDImageLoader();

export const createMatchDamageFile = async (match: Galeforce.dto.MatchDTO, participant: Participant) => {
    const canva = createCanvas(630, 565);
    const ctx = canva.getContext("2d");

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 630, 565);

    const sortedPlayers = sortPlayersByTeamAndRole(match.info.participants);
    const blueSidePlayers = sortedPlayers[blueSide];
    const redSidePlayers = sortedPlayers[redSide];

    const maxDamage = Math.max(...match.info.participants.map((p) => p.totalDamageDealtToChampions));
    const maxWidth = 630 - options.padding * 3 - options.championIconSize;

    const { x, y, width, height } = getRectArguments(participant, blueSidePlayers, redSidePlayers);
    ctx.strokeStyle = "#FDB05F";
    ctx.lineWidth = 4;
    ctx.strokeRect(x - ctx.lineWidth / 2, y - ctx.lineWidth / 2, width + ctx.lineWidth, height + ctx.lineWidth);

    const baseX = options.padding;
    const baseY = options.padding;

    for (const [index, player] of blueSidePlayers.entries()) {
        const topY = baseY + (options.championIconSize + options.championIconSpace) * index;

        const icon = await imageLoader.loadImage(await getChampionIconUrl(player.championName));
        ctx.drawImage(icon, baseX, topY, options.championIconSize, options.championIconSize);

        const damage = player.totalDamageDealtToChampions;
        const width = (damage / maxDamage) * maxWidth;

        ctx.fillStyle = "#2AA3CC";
        ctx.fillRect(
            baseX + options.championIconSize + options.padding,
            topY + options.damageMargin,
            width,
            options.championIconSize - options.damageMargin * 2
        );

        ctx.font = "18px Arial";
        ctx.fillStyle = "white";

        const text = `${player.totalDamageDealtToChampions.toLocaleString()}`;
        ctx.fillText(
            text,
            baseX + options.championIconSize + options.padding * 2,
            topY + options.championIconSize / 2 + 6
        );
    }

    const redSideY = options.padding + 5 * (options.championIconSize + options.championIconSpace) + options.padding * 2;
    for (const [index, player] of redSidePlayers.entries()) {
        const topY = redSideY + (options.championIconSize + options.championIconSpace) * index;

        const icon = await imageLoader.loadImage(await getChampionIconUrl(player.championName));
        ctx.drawImage(icon, baseX, topY, options.championIconSize, options.championIconSize);

        const damage = player.totalDamageDealtToChampions;
        const width = (damage / maxDamage) * maxWidth;

        ctx.fillStyle = "#ff5859";
        ctx.fillRect(
            baseX + options.championIconSize + options.padding,
            topY + options.damageMargin,
            width,
            options.championIconSize - options.damageMargin * 2
        );

        ctx.font = "18px Arial";
        ctx.fillStyle = "white";

        const text = `${player.totalDamageDealtToChampions.toLocaleString()}`;
        ctx.fillText(
            text,
            baseX + options.championIconSize + options.padding * 2,
            topY + options.championIconSize / 2 + 6
        );
    }

    return canva.toBuffer();
};

const getRectArguments = (participant: Participant, blueSidePlayers: Participant[], redSidePlayers: Participant[]) => {
    const blueSideIndex = blueSidePlayers.findIndex((p) => p.puuid === participant.puuid);
    const redSideIndex = redSidePlayers.findIndex((p) => p.puuid === participant.puuid);

    const isBlueSide = blueSideIndex !== -1;
    const index = isBlueSide ? blueSideIndex : redSideIndex;

    const width = options.championIconSize;
    const height = options.championIconSize;

    const x = options.padding;
    const y =
        options.padding +
        (options.championIconSize + options.championIconSpace) * index +
        (isBlueSide ? 0 : options.padding * 2);

    return { x, y, width, height };
};
