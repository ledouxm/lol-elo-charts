import fs from "fs/promises";
import Galeforce from "galeforce";
import Mustache from "mustache";
import { getChampionIconUrl } from "../lol/icons";
import { Participant } from "../summoner";
import { getScreenshotBuffer } from "./browser";
import { blueSide, redSide, sortPlayersByTeamAndRole } from "./matchDetails";

export const createMatchDamageFile = async (match: Galeforce.dto.MatchDTO, participant: Participant) => {
    const template = await fs.readFile("src/features/details/matchDamage.html", "utf-8");
    const players = sortPlayersByTeamAndRole(match.info.participants);
    const bs = players[blueSide];
    const rs = players[redSide];

    const maxDamage = Math.max(...match.info.participants.map((p) => p.totalDamageDealtToChampions));
    const getDamagePercentage = (p: Participant) => p.totalDamageDealtToChampions / maxDamage;

    const makePlayer = async (p: Participant) => {
        return {
            championImage: await getChampionIconUrl(p.championName),
            damagePercent: getDamagePercentage(p) * 100,
            damage: p.totalDamageDealtToChampions.toLocaleString(),
            isPlayer: p.puuid === participant.puuid,
        };
    };

    const blueSidePlayers = await Promise.all(bs.map(makePlayer));
    const redSidePlayers = await Promise.all(rs.map(makePlayer));

    const html = Mustache.render(template, {
        blueSidePlayers,
        redSidePlayers,
    });

    return getScreenshotBuffer({ html, clip: { x: 0, y: 0, width: 700, height: 562 } });
};
