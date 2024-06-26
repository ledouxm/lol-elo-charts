import Galeforce from "galeforce";
import { db } from "../../db/db";
import { apex } from "../../db/schema";
import { generate24hRecaps } from "../generate24hRecap";
import { galeforce, getQueueRank } from "../summoner";
import { desc } from "drizzle-orm";

const getApex = async () => {
    const masters = await getQueueRank(galeforce.tier.MASTER);
    const grandmasters = await getQueueRank(galeforce.tier.GRANDMASTER);
    const challengers = await getQueueRank(galeforce.tier.CHALLENGER);

    const getMaxLp = (league: Galeforce.dto.LeagueListDTO) => {
        return Math.max(...league.entries.map((e) => e.leaguePoints));
    };

    return { master: getMaxLp(masters), grandmaster: getMaxLp(grandmasters), challenger: getMaxLp(challengers) };
};

export const getAndSaveApex = async () => {
    const riotApex = await getApex();

    await db.insert(apex).values(riotApex);

    return generate24hRecaps();
};

export const getLastApex = async () => {
    const lastApex = await db.select().from(apex).orderBy(desc(apex.createdAt)).limit(1);
    return lastApex?.[0];
};
