import Galeforce from "galeforce";
import { groupBy, sortArrayOfObjectByPropFromArray } from "pastable";
import { ChampionFullDTO, Spell } from "../types";
import { MatchDTO } from "galeforce/dist/galeforce/interfaces/dto";

const ref = { context: null as any } as { context: DefaultProps };

export const setContext = (props: DefaultProps) => {
    if (ref.context) return;
    ref.context = props;
};

export const ordinalSuffixOf = (i: number) => {
    let j = i % 10,
        k = i % 100;
    if (j === 1 && k !== 11) {
        return i + "st";
    }
    if (j === 2 && k !== 12) {
        return i + "nd";
    }
    if (j === 3 && k !== 13) {
        return i + "rd";
    }
    return i + "th";
};

export const sortPlayersByTeamAndRole = (players: Participant[]) => {
    const sortedByRole = sortArrayOfObjectByPropFromArray(players, "teamPosition", roleOrder);
    const sortedByTeam = groupBy(sortedByRole, "teamId");

    return sortedByTeam as Record<AnySide, Participant[]>;
};

export const getChampionImage = (championName: string) => {
    return `https://ddragon.leagueoflegends.com/cdn/${ref.context.version}/img/champion/${championName}.png`;
};

export const getSummonerSpellImage = (summonerId: number | string) => {
    const summoner = Object.values(ref.context.summoner).find((s) => s.key == summonerId);
    return `https://ddragon.leagueoflegends.com/cdn/${ref.context.version}/img/spell/${summoner?.image.full}`;
};

export const getItemImage = (itemId: number) => {
    return `https://ddragon.leagueoflegends.com/cdn/${ref.context.version}/img/item/${itemId}.png`;
};

export const getSpellImage = (spell: Spell) => {
    return `https://ddragon.leagueoflegends.com/cdn/${ref.context.version}/img/spell/${spell.image.full}`;
};

export type DefaultProps = {
    match: Galeforce.dto.MatchDTO;
    participant: Participant;
    version: string;
    champion: Galeforce.dto.DataDragonChampionDTO["data"];
    summoner: Galeforce.dto.DataDragonSummonerSpellListDTO["data"];
    championFull: ChampionFullDTO["data"];
};

export type Participant = Galeforce.dto.MatchDTO["info"]["participants"][0];

export const roleOrder = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
export const blueSide = 100 as const;
export const redSide = 200 as const;

export type AnySide = typeof blueSide | typeof redSide;

export const pingKeys = [
    "holdPings",
    "pushPings",
    "allInPings",
    "basicPings",
    "dangerPings",
    "getBackPings",
    "onMyWayPings",
    "assistMePings",
    "needVisionPings",
    "enemyVisionPings",
    "enemyMissingPings",
    "visionClearedPings",
] as const;

export const pingImages: Record<PingType, string> = {
    allInPings: "https://static.wikia.nocookie.net/leagueoflegends/images/e/e3/All_In_ping.png",
    assistMePings: "https://static.wikia.nocookie.net/leagueoflegends/images/f/ff/Assist_Me_ping.png",
    basicPings: "https://static.wikia.nocookie.net/leagueoflegends/images/a/ae/Generic_ping.png",
    enemyMissingPings: "https://static.wikia.nocookie.net/leagueoflegends/images/c/c0/Enemy_Missing_ping.png",
    enemyVisionPings: "https://static.wikia.nocookie.net/leagueoflegends/images/a/ab/Enemy_Vision_ping.png",
    getBackPings: "https://static.wikia.nocookie.net/leagueoflegends/images/d/db/Caution_ping.png",
    dangerPings: "https://static.wikia.nocookie.net/leagueoflegends/images/8/82/Retreat_ping.png",
    holdPings: "https://static.wikia.nocookie.net/leagueoflegends/images/4/40/Hold_ping.png",
    needVisionPings: "https://static.wikia.nocookie.net/leagueoflegends/images/b/b7/Need_Vision_ping.png",
    onMyWayPings: "https://static.wikia.nocookie.net/leagueoflegends/images/a/a6/On_My_Way_ping.png",
    pushPings: "https://static.wikia.nocookie.net/leagueoflegends/images/d/d7/Push_ping.png",
    visionClearedPings: "https://static.wikia.nocookie.net/leagueoflegends/images/4/4c/Vision_Cleared_ping.png",
};

type PingType = (typeof pingKeys)[number];

export const objectiveKeys: ObjectiveKeys[] = ["baron", "dragon", "horde", "inhibitor", "riftHerald", "tower"];

export type ObjectiveKeys = keyof MatchDTO["info"]["teams"][0]["objectives"];
