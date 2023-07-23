import { addRequest, galeforce } from "../summoner";

export const getSummonerData = async (puuid: string) => {
    const summonerData = await galeforce.lol.summoner().region(galeforce.region.lol.EUROPE_WEST).puuid(puuid).exec();
    await addRequest();
    return summonerData;
};

export const getElos = async (id: string) => {
    const result = await galeforce.lol.league
        .entries()
        .summonerId(id)
        .region(galeforce.region.lol.EUROPE_WEST)
        .queue(galeforce.queue.lol.RANKED_SOLO)
        .exec();
    await addRequest();
    return result;
};

export const getSoloQElo = async (id: string) => {
    const elos = await getElos(id);
    const elo = elos.find((e) => e.queueType === "RANKED_SOLO_5x5");
    if (!elo) return null;

    return elo;
};
