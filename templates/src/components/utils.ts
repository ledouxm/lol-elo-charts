import Galeforce from "galeforce";
import { groupBy, sortArrayOfObjectByPropFromArray } from "pastable";

let context: DefaultProps = null as any;
export const setContext = (props: DefaultProps) => {
    context = props;
};

export const sortPlayersByTeamAndRole = (players: Participant[]) => {
    const sortedByRole = sortArrayOfObjectByPropFromArray(players, "teamPosition", roleOrder);
    const sortedByTeam = groupBy(sortedByRole, "teamId");

    return sortedByTeam as Record<AnySide, Participant[]>;
};

export const getChampionImage = (championName: string) => {
    return `https://ddragon.leagueoflegends.com/cdn/${context.version}/img/champion/${championName}.png`;
};

export type DefaultProps = {
    match: Galeforce.dto.MatchDTO;
    participant: Participant;
    version: string;
    champion: Galeforce.dto.DataDragonChampionDTO;
    summoner: Galeforce.dto.DataDragonSummonerSpellListDTO;
};

export type Participant = Galeforce.dto.MatchDTO["info"]["participants"][0];

export const roleOrder = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
export const blueSide = 100 as const;
export const redSide = 200 as const;

type AnySide = typeof blueSide | typeof redSide;
