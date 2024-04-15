import Galeforce from "galeforce";
import { groupBy, sortArrayOfObjectByPropFromArray } from "pastable";
import { ChampionFullDTO, Spell } from "../types";
import { MatchDTO } from "galeforce/dist/galeforce/interfaces/dto";
import { ValorantMatch, ValorantMmr } from "../../../core/src/features/stalker/valorant/ValorantService";
const ref = { context: null as any } as { context: DefaultProps };
const refValorant = { context: null as any } as { context: DefaultValorantProps };

export const setContext = (props: DefaultProps) => {
    if (ref.context) return;
    ref.context = props;
};

export const setValorantContext = (props: DefaultValorantProps) => {
    if (ref.context) return;
    refValorant.context = props;
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


export const sortByCombatScore = (players: ValorantParticipant[]) => {

    const sortedByScore =  players.sort((a, b) => b.stats.score - a.stats.score);
    const sortedByTeam = groupBy(sortedByScore, "team");

    return sortedByTeam as Record<ValorantSide, ValorantParticipant[]>;
}

export const computeAverageCombatScore = (score: number, rounds: number) => {
    return score / rounds;
};

export const computeHsPercentage = (bs: number, hs: number, ls: number) => {
    const total = bs + hs + ls;
    return Math.round((hs / total) * 100);
}

export const markPremades = (players: ValorantParticipant[]) => {
    const premades = groupBy(players, "party_id");
    const stringToColor = (str: string) => {
        let hash = 0;
        str.split('').forEach(char => {
          hash = char.charCodeAt(0) + ((hash << 5) - hash)
        })
        let colour = '#'
        for (let i = 0; i < 3; i++) {
          let value = (hash >> (i * 8)) & 0xff;
          value = Math.floor(value * 0.5);
          colour += value.toString(16).padStart(2, '0');
        }
        return colour;
    }
    for (const [partyId, premade] of Object.entries(premades)) {
        if (premade.length > 1) {
            const color = stringToColor(partyId);
            premade.forEach((p) => (p.isPremade = color));
        }
    }
    return players;
}

export const computeEconRating = (damage_made: number, economy_spent: number) => {
    return Math.round((damage_made / economy_spent) * 1000);
}


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

export const getValorantRankImage = (rank: number) => {
    return `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/${rank}/largeicon.png`;
}

export type DefaultProps = {
    match: Galeforce.dto.MatchDTO;
    participant: Participant;
    version: string;
    champion: Galeforce.dto.DataDragonChampionDTO["data"];
    summoner: Galeforce.dto.DataDragonSummonerSpellListDTO["data"];
    championFull: ChampionFullDTO["data"];
};


export type DefaultValorantProps = {
    match: ValorantMatch;
    participant: ValorantParticipant;
    mmr: ValorantMmr;
};

export type ValorantParticipant = ValorantMatch["players"][0];

export type Participant = Galeforce.dto.MatchDTO["info"]["participants"][0];

export const roleOrder = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
export const blueSide = 100 as const;
export const redSide = 200 as const;

export type AnySide = typeof blueSide | typeof redSide;

export type ValorantSide = "Red" | "Blue";
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
