import Galeforce from "galeforce";
import { db } from "../db/db";
import { apex } from "../db/schema";
import { generate24hRecaps } from "./generate24hRecap";
import { galeforce } from "./summoner";

const getApex = async () => {
    const masters = await galeforce.lol.league
        .league()
        .queue(galeforce.queue.lol.RANKED_SOLO)
        .tier(galeforce.tier.MASTER)
        .region(galeforce.region.lol.EUROPE_WEST)
        .exec();
    const grandmasters = await galeforce.lol.league
        .league()
        .queue(galeforce.queue.lol.RANKED_SOLO)
        .tier(galeforce.tier.GRANDMASTER)
        .region(galeforce.region.lol.EUROPE_WEST)
        .exec();
    const challengers = await galeforce.lol.league
        .league()
        .queue(galeforce.queue.lol.RANKED_SOLO)
        .tier(galeforce.tier.CHALLENGER)
        .region(galeforce.region.lol.EUROPE_WEST)
        .exec();

    const getMaxLp = (league: Galeforce.dto.LeagueListDTO) => {
        return Math.max(...league.entries.map((e) => e.leaguePoints));
    };

    return { master: getMaxLp(masters), grandmaster: getMaxLp(grandmasters), challenger: getMaxLp(challengers) };
};

export const getAndSaveApex = async () => {
    console.log("retrieving apex at ", new Date().toISOString());
    const riotApex = await getApex();

    await db.insert(apex).values(riotApex);

    return generate24hRecaps();
};
