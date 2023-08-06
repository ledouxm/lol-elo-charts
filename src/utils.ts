import { debug } from "debug";
import { InsertRank } from "./db/schema";

export const makeDebug = (suffix: string) => debug("backend-with-ci").extend(suffix);

export function rainbow(step: number, numOfSteps = 1000) {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    let r = 0,
        g = 0,
        b = 0;
    let h = step / numOfSteps;
    let i = ~~(h * 6);
    let f = h * 6 - i;
    let q = 1 - f;
    switch (i % 6) {
        case 0:
            r = 1;
            g = f;
            b = 0;
            break;
        case 1:
            r = q;
            g = 1;
            b = 0;
            break;
        case 2:
            r = 0;
            g = 1;
            b = f;
            break;
        case 3:
            r = 0;
            g = q;
            b = 1;
            break;
        case 4:
            r = f;
            g = 0;
            b = 1;
            break;
        case 5:
            r = 1;
            g = 0;
            b = q;
            break;
    }
    var c =
        "#" +
        ("00" + (~~(r * 255)).toString(16)).slice(-2) +
        ("00" + (~~(g * 255)).toString(16)).slice(-2) +
        ("00" + (~~(b * 255)).toString(16)).slice(-2);
    return c;
}

export const getMostOcurrence = (arr: Array<string>) => {
    const b = {};
    let max = "";
    let maxi = 0;
    for (let k of arr) {
        if (b[k]) b[k]++;
        else b[k] = 1;
        if (maxi < b[k]) {
            max = k;
            maxi = b[k];
        }
    }
    return max;
};

export type MinimalRank = Pick<InsertRank, "tier" | "division" | "leaguePoints">;

const tiers = ["IRON", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER"];
const ranks = ["IV", "III", "II", "I"];
export const getRankDifference = (oldRank: MinimalRank, newRank: MinimalRank) => {
    const sameTier = oldRank.tier === newRank.tier;
    const sameRank = oldRank.division === newRank.division;

    const hasRankPromoted =
        ranks.findIndex((rank) => rank === oldRank.division) < ranks.findIndex((rank) => rank === newRank.division);

    if (!sameTier || !sameRank) {
        const hasTierPromoted =
            tiers.findIndex((tier) => tier === oldRank.tier) < tiers.findIndex((tier) => tier === newRank.tier);
        const hasPromoted = hasTierPromoted || (hasRankPromoted && sameTier);

        return {
            type: hasPromoted ? "PROMOTION" : "DEMOTION",
            from: formatRank(oldRank),
            to: formatRank(newRank),
            content: `${hasPromoted ? "PROMOTED" : "DEMOTED"} TO ${newRank.tier} ${newRank.division}`,
        };
    }

    const lpDifference = oldRank.leaguePoints - newRank.leaguePoints;
    const hasLost = lpDifference > 0;
    return {
        type: hasLost ? "LOSS" : "WIN",
        from: formatRank(oldRank),
        to: formatRank(newRank),
        content: `${hasLost ? "-" : "+"}${Math.abs(lpDifference)} LP`,
    };
};

export type RankDifference = ReturnType<typeof getRankDifference>;

export const formatRank = (ranking: MinimalRank) =>
    `${ranking.tier}${ranking.division !== "NA" ? ` ${ranking.division}` : ""} - ${ranking.leaguePoints} LP`;

export const areRanksEqual = (oldRank: MinimalRank, newRank: MinimalRank) => {
    return (
        oldRank.tier === newRank.tier &&
        oldRank.division === newRank.division &&
        oldRank.leaguePoints === newRank.leaguePoints
    );
};

const winColor = 0x00ff26;
const lossColor = 0xff0000;

export const getColor = (isLoss: boolean) => (isLoss ? lossColor : winColor);

const winEmoji = ":chart_with_upwards_trend:";
const lossEmoji = ":chart_with_downwards_trend:";

export const getEmoji = (isLoss: boolean) => (isLoss ? lossEmoji : winEmoji);

const winArrow = ":arrow_upper_right:";
const lossArrow = ":arrow_lower_right:";

export const getArrow = (isLoss: boolean) => (isLoss ? lossArrow : winArrow);
