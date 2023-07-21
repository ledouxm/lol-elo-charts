import { galeforce } from "../summoner";

export const getSummonerData = async (puuid: string) =>
    galeforce.lol.summoner().region(galeforce.region.lol.EUROPE_WEST).puuid(puuid).exec();

export const getElos = async (id: string) =>
    galeforce.lol.league
        .entries()
        .summonerId(id)
        .region(galeforce.region.lol.EUROPE_WEST)
        .queue(galeforce.queue.lol.RANKED_SOLO)
        .exec();

export const getSoloQElo = async (id: string) => {
    const elos = await getElos(id);
    const elo = elos.find((e) => e.queueType === "RANKED_SOLO_5x5");
    if (!elo) return null;

    return elo;
};
