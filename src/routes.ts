import { Router } from "express";
import { handleRequest } from "./httpUtils/requests";
import { getEm, getOrm } from "./db";
import Galeforce from "galeforce";
import { Apex, Rank, Summoner } from "./entities/Summoner";

const galeforce = new Galeforce({ "riot-api": { key: process.env.RG_API_KEY } });

export const router: Router = Router();
router.get(
    "/",
    handleRequest(() => ({ hello: "world" }))
);

router.get(
    "/summoners",
    handleRequest(async ({ withRank, after }) => {
        const em = getEm();
        const summoners = await em.find(Summoner, after ? { ranks: { createdAt: { $gt: new Date(after) } } } : {}, {
            populate: withRank ? ["ranks"] : [],
            orderBy: withRank ? { ranks: { createdAt: "asc" } } : undefined,
        });
        return summoners;
    })
);

router.get(
    "/apex",
    handleRequest(async () => {
        const em = getEm();
        const apex = await em.find(Apex, {}, { orderBy: { createdAt: "desc" } });

        return apex;
    })
);

router.post(
    "/summoners",
    handleRequest(async ({ name }) => {
        try {
            const summoner = await galeforce.lol.summoner().region(galeforce.region.lol.EUROPE_WEST).name(name).exec();

            const em = getEm();

            const summonerEntity = em.create(Summoner, {
                puuid: summoner.puuid,
                summonerId: summoner.id,
                currentName: summoner.name,
            });

            await em.persistAndFlush(summonerEntity);

            return summonerEntity;
        } catch (e) {
            console.log(e);
            throw e;
        }
    })
);

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
    const em = getOrm().em.fork();
    const apex = await getApex();

    const apexEntity = em.create(Apex, apex);

    return em.persistAndFlush(apexEntity);
};

export const checkElo = async () => {
    const em = getOrm().em.fork();
    const summoners = await em.find(Summoner, {});
    console.log(
        "checking elo for summoners: ",
        summoners.map((s) => s.currentName).join(", "),
        " at ",
        new Date().toISOString()
    );

    for (const summoner of summoners) {
        const summonerData = await galeforce.lol
            .summoner()
            .region(galeforce.region.lol.EUROPE_WEST)
            .name(summoner.currentName)
            .exec();

        if (summonerData.name !== summoner.currentName) {
            summoner.currentName = summonerData.name;
            em.persist(summoner);
        }

        const elos = await galeforce.lol.league
            .entries()
            .summonerId(summoner.summonerId)
            .region(galeforce.region.lol.EUROPE_WEST)
            .queue(galeforce.queue.lol.RANKED_SOLO)
            .exec();

        const elo = elos.find((e) => e.queueType === "RANKED_SOLO_5x5");
        if (!elo) continue;

        const rank = em.create(Rank, {
            summoner: summoner,
            tier: elo.tier,
            leaguePoints: elo.leaguePoints,
            rank: elo.rank,
        });

        em.persist(rank);
    }

    await em.flush();
};
