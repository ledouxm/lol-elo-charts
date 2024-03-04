import fs from "fs/promises";
import Galeforce from "galeforce";
import Mustache from "mustache";
import { groupBy, sortArrayOfObjectByPropFromArray } from "pastable";
import {
    getChampionIconUrl,
    getItemIconUrl,
    getSummonerSpellIconImageData,
    getSummonerSpellIconUrl,
} from "../lol/icons";
import { Participant } from "../summoner";
import { getScreenshotBuffer } from "./browser";

export const createMatchDetailsFile = async (match: Galeforce.dto.MatchDTO, participant: Participant) => {
    const template = await fs.readFile("src/features/details/matchDetail.html", "utf-8");
    const players = sortPlayersByTeamAndRole(match.info.participants);
    const bs = players[blueSide];
    const rs = players[redSide];

    const getItemIcon = async (itemId: number) => {
        if (itemId === 0) return "";
        return await getItemIconUrl(itemId);
    };

    const makePlayer = async (p: Participant) => {
        const summonerSpell1Image = await getSummonerSpellIconUrl(
            (
                await getSummonerSpellIconImageData(p.summoner1Id)
            ).full
        );
        const summonerSpell2Image = await getSummonerSpellIconUrl(
            (
                await getSummonerSpellIconImageData(p.summoner2Id)
            ).full
        );

        return {
            championImage: await getChampionIconUrl(p.championName),
            summonerSpell1Image,
            summonerSpell2Image,
            kills: p.kills,
            deaths: p.deaths,
            assists: p.assists,
            creepScore: p.totalMinionsKilled + p.neutralMinionsKilled,
            item0Image: await getItemIcon(p.item0),
            item1Image: await getItemIcon(p.item1),
            item2Image: await getItemIcon(p.item2),
            item3Image: await getItemIcon(p.item3),
            item4Image: await getItemIcon(p.item4),
            item5Image: await getItemIcon(p.item5),
            item6Image: await getItemIcon(p.item6),
            isPlayer: p.puuid === participant.puuid,
        };
    };

    const blueSidePlayers = await Promise.all(bs.map(makePlayer));
    const redSidePlayers = await Promise.all(rs.map(makePlayer));

    const hasBlueSideWon = match.info.teams[0].win;

    const html = Mustache.render(template, {
        blueSidePlayers,
        redSidePlayers,
        blueSideText: hasBlueSideWon ? "Victory" : "Defeat",
        redSideText: hasBlueSideWon ? "Defeat" : "Victory",
    });

    return getScreenshotBuffer(html, { x: 0, y: 0, width: 700, height: 464 });
};

export const sortPlayersByTeamAndRole = (players: Participant[]) => {
    const sortedByRole = sortArrayOfObjectByPropFromArray(players, "teamPosition", roleOrder);
    const sortedByTeam = groupBy(sortedByRole, "teamId");

    return sortedByTeam as Record<AnySide, Participant[]>;
};

const roleOrder = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
export const blueSide = 100 as const;
export const redSide = 200 as const;

type AnySide = typeof blueSide | typeof redSide;
