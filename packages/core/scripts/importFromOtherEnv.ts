import axios from "axios";
import { db } from "@/db/db";
import { addSummoner, galeforce, getSummonerByName } from "@/features/summoner";
import { arenaPlayer, Gambler, summoner, Summoner } from "@/db/schema";
import type * as Schema from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getSummonerData } from "@/features/lol/summoner";

const { DISTANT_ADMIN_TOKEN, DISTANT_API_URL, CHANNEL_ID } = process.env;

if (!DISTANT_ADMIN_TOKEN || !DISTANT_API_URL || !CHANNEL_ID) {
    console.error("Please set DISTANT_ADMIN_TOKEN, DISTANT_API_URL, and CHANNEL_ID in your environment variables.");
    process.exit(1);
}

const result = await axios.get<ExportData>(`${DISTANT_API_URL}/api/export`, {
    headers: {
        Authorization: `Bearer ${DISTANT_ADMIN_TOKEN}`,
    },
    params: {
        channelId: CHANNEL_ID,
        days: 7,
    },
});

const processSummoners = async (summoners: Schema.Summoner[], arenaPlayers: Schema.ArenaPlayer[]) => {
    const existingSummoners = await db.select().from(summoner).where(eq(summoner.channelId, CHANNEL_ID));
    const existingPuuids = new Set(existingSummoners.map((s) => s.puuid));
    const newSummoners = summoners.filter((s) => !existingPuuids.has(s.puuid));

    const puuidMap = new Map<string, string>();

    for (const summonerData of newSummoners) {
        const [summonerName, tag] = summonerData.currentName.split("#");
        const riotSummoner = await getSummonerByName(summonerName, tag);
        await addSummoner(riotSummoner, CHANNEL_ID);
    }

    console.log("Inserted new summoners:", newSummoners.length);
};

type ExportData = {
    summoners: Schema.Summoner[];
    gamblers: Schema.Gambler[];
    apexes: Schema.Apex[];
    arenaPlayers: Schema.ArenaPlayer[];
    arenaMatches: Schema.ArenaMatch[];
    bets: Schema.Bet[];
    ranks: Schema.InsertRank[];
    matches: Schema.InsertRank[];
    playersOfTheDay: Schema.PlayerOfTheDay[];
};
