import { Apex, InsertRank, divisionEnum, tierEnum } from "../db/schema";

export type TierData = Record<InsertRank["tier"], { nbDivision: number; lpMax: number }>;

export const makeTierLps = (apex: Apex): Record<InsertRank["tier"], number> => ({
    IRON: 0,
    BRONZE: 400,
    SILVER: 800,
    GOLD: 1200,
    PLATINUM: 1600,
    EMERALD: 2000,
    DIAMOND: 2400,
    MASTER: 2800,
    GRANDMASTER: 2800 + apex.master,
    CHALLENGER: 2800 + apex.master + apex.grandmaster,
});

export const makeTierData = (apex: Apex) => {
    return {
        ...tierEnum.enumValues.reduce((obj, current) => ({ ...obj, [current]: { nbDivision: 4, lpMax: 100 } }), {}),
        ...Object.entries(apex).reduce(
            (obj, [key, val]) => ({ ...obj, [key.toUpperCase()]: { nbDivision: 1, lpMax: val } }),
            {}
        ),
    } as TierData;
};

export const getTotalLpFromRank = (rank: InsertRank, tierData: TierData) => {
    let totalLp = 0;

    const tierIndex = tierEnum.enumValues.findIndex((tier) => tier === rank.tier);
    totalLp += rank.leaguePoints;
    totalLp += tierEnum.enumValues
        .filter((_, index) => index < tierIndex)
        .reduce((acc, tier) => acc + tierData[tier].nbDivision * tierData[tier].lpMax, 0);

    if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(rank.tier)) {
        return totalLp;
    }

    const divisionIndex = divisionEnum.enumValues.findIndex((division) => division === rank.division);
    totalLp += divisionEnum.enumValues
        .filter((_, index) => index < divisionIndex)
        .reduce((acc) => acc + tierData[rank.tier].lpMax, 0);

    return totalLp;
};
