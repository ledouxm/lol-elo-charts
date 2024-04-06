import { InsertRank } from "@/db/schema";
import { LoLRankWithWinsLosses } from "./rank";

const tiers = [
    "IRON",
    "BRONZE",
    "SILVER",
    "GOLD",
    "PLATINUM",
    "EMERALD",
    "DIAMOND",
    "MASTER",
    "GRANDMASTER",
    "CHALLENGER",
];

const ranks = ["IV", "III", "II", "I"];
export const getRankDifference = (oldRank: InsertRank, newRank: LoLRankWithWinsLosses) => {
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

export const formatRank = (ranking: Pick<InsertRank, "tier" | "division" | "leaguePoints">) =>
    `${ranking.tier}${ranking.division !== "NA" ? ` ${ranking.division}` : ""} - ${ranking.leaguePoints} LP`;

export const areRanksEqual = (oldRank: InsertRank, newRank: LoLRankWithWinsLosses) => {
    return (
        oldRank?.tier === newRank?.tier &&
        oldRank?.division === newRank?.division &&
        oldRank?.leaguePoints === newRank?.leaguePoints
    );
};
