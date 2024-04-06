import { MinimalRank } from "@/utils";
import { Apex, InsertRank, divisionEnum, tierEnum } from "../../db/schema";

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

export const getTotalLpFromRank = (rank: MinimalRank, tierData: TierData) => {
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

export const getRankFromTotalLp = (totalLp: number, tierData: TierData): MinimalRank => {
    let totalLpLeft = totalLp;

    const tier = tierEnum.enumValues.find((tier) => {
        const tierLp = tierData[tier].nbDivision * tierData[tier].lpMax;
        if (totalLpLeft > tierLp) {
            totalLpLeft -= tierLp;
            return false;
        }
        return true;
    });

    if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier)) {
        return { tier, division: "I", leaguePoints: totalLpLeft };
    }

    const division = divisionEnum.enumValues.find(() => {
        const divisionLp = tierData[tier].lpMax;
        if (totalLpLeft > divisionLp) {
            totalLpLeft -= divisionLp;
            return false;
        }
        return true;
    });

    return { tier, division, leaguePoints: totalLpLeft };
};

const divisionToNumber = (division: InsertRank["division"]) => {
    switch (division) {
        case "I":
            return 1;
        case "II":
            return 2;
        case "III":
            return 3;
        case "IV":
            return 4;
    }
};
export const getMinifiedRank = (rank: MinimalRank) =>
    `${rank.tier[0]}${divisionToNumber(rank.division as any)}-${rank.leaguePoints}LP` as string;
