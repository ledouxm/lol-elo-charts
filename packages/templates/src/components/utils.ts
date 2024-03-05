import Galeforce from "galeforce";
import { groupBy, sortArrayOfObjectByPropFromArray } from "pastable";

const ref = { context: null as any } as { context: DefaultProps };

export const setContext = (props: DefaultProps) => {
    if (ref.context) return;
    ref.context = props;
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

export type DefaultProps = {
    match: Galeforce.dto.MatchDTO;
    participant: Participant;
    version: string;
    champion: Galeforce.dto.DataDragonChampionDTO["data"];
    summoner: Galeforce.dto.DataDragonSummonerSpellListDTO["data"];
};

export type Participant = Galeforce.dto.MatchDTO["info"]["participants"][0];

export const roleOrder = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
export const blueSide = 100 as const;
export const redSide = 200 as const;

export type AnySide = typeof blueSide | typeof redSide;
