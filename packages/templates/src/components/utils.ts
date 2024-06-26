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

    const sortedByScore = players.sort((a, b) => b.stats.score - a.stats.score);
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

export const getParticipantTeam = (participant: ValorantParticipant, match: ValorantMatch) => {
    return match.players.all_players.find((p: { puuid: any; }) => p.puuid === participant.puuid).team;
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

export function getFirstBloodCounts(killEvents: KillEvent[], players: ValorantParticipant[]) {
    const firstBloodCounts: { [key: string]: number } = {};

    players.forEach((player) => {
        firstBloodCounts[player.puuid] = 0;
    });
    let currentRound = -1;
    let killerPuuid = "";
  
    killEvents.forEach(killEvent => {
      if (killEvent.round !== currentRound) {
        currentRound = killEvent.round;
        killerPuuid = killEvent.killer_puuid;
        firstBloodCounts[killerPuuid]++;
      }
    });
    players.forEach(player => {
      player.first_blood_count = firstBloodCounts[player.puuid];
    });
    return players;
}

export type KillEvent = {
    kill_time_in_round: number
    kill_time_in_match: number
    round: number
    killer_puuid: string
    killer_display_name: string
    killer_team: string
    victim_puuid: string
    victim_display_name: string
    victim_team: string
    victim_death_location: {
      x: number
      y: number
    }
    damage_weapon_id: string
    damage_weapon_name: string
    damage_weapon_assets: {
      display_icon: string
      killfeed_icon: string
    }
    secondary_fire_mode: boolean
    player_locations_on_kill: Array<{
      player_puuid: string
      player_display_name: string
      player_team: string
      location: {
        x: number
        y: number
      }
      view_radians: number
    }>
    assistants: Array<{
      assistant_puuid: string
      assistant_display_name: string
      assistant_team: string
    }>
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

export type Round = Array<{
    winning_team: ValorantSide
    end_type: string
    bomb_planted: boolean
    bomb_defused: boolean
    plant_events: {
      plant_location?: {
        x: number
        y: number
      }
      planted_by?: {
        puuid: string
        display_name: string
        team: string
      }
      plant_site?: string
      plant_time_in_round?: number
      player_locations_on_plant?: Array<{
        player_puuid: string
        player_display_name: string
        player_team: string
        location: {
          x: number
          y: number
        }
        view_radians: number
      }>
    }
    defuse_events: {
      defuse_location?: {
        x: number
        y: number
      }
      defused_by?: {
        puuid: string
        display_name: string
        team: string
      }
      defuse_time_in_round?: number
      player_locations_on_defuse?: Array<{
        player_puuid: string
        player_display_name: string
        player_team: string
        location: {
          x: number
          y: number
        }
        view_radians: number
      }>
    }
    player_stats: Array<{
      ability_casts: {
        c_casts: any
        q_casts: any
        e_cast: any
        x_cast: any
      }
      player_puuid: string
      player_display_name: string
      player_team: string
      damage_events: Array<{
        receiver_puuid: string
        receiver_display_name: string
        receiver_team: string
        bodyshots: number
        damage: number
        headshots: number
        legshots: number
      }>
      damage: number
      bodyshots: number
      headshots: number
      legshots: number
      kill_events: Array<{
        kill_time_in_round: number
        kill_time_in_match: number
        killer_puuid: string
        killer_display_name: string
        killer_team: string
        victim_puuid: string
        victim_display_name: string
        victim_team: string
        victim_death_location: {
          x: number
          y: number
        }
        damage_weapon_id: string
        damage_weapon_name?: string
        damage_weapon_assets: {
          display_icon?: string
          killfeed_icon?: string
        }
        secondary_fire_mode: boolean
        player_locations_on_kill: Array<{
          player_puuid: string
          player_display_name: string
          player_team: string
          location: {
            x: number
            y: number
          }
          view_radians: number
        }>
        assistants: Array<{
          assistant_puuid: string
          assistant_display_name: string
          assistant_team: string
        }>
      }>
      kills: number
      score: number
      economy: {
        loadout_value: number
        weapon: {
          id: string
          name: string
          assets: {
            display_icon: string
            killfeed_icon: string
          }
        }
        armor: {
          id?: string
          name?: string
          assets: {
            display_icon?: string
          }
        }
        remaining: number
        spent: number
      }
      was_afk: boolean
      was_penalized: boolean
      stayed_in_spawn: boolean
    }>
  }>
  

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
