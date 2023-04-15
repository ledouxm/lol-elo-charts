import { Router } from "express";
import { handleRequest } from "./httpUtils/requests";
import { getEm, getOrm } from "./db";
import Galeforce from "galeforce";
import { Rank, Summoner } from "./entities/Summoner";

const galeforce = new Galeforce({ "riot-api": { key: process.env.RG_API_KEY } });

export const router: Router = Router();
router.get(
    "/",
    handleRequest(() => ({ hello: "world" }))
);

router.get(
    "/summoners",
    handleRequest(async ({ withRank }) => {
        const em = getEm();
        const summoners = await em.find(Summoner, {}, { populate: withRank ? ["ranks"] : [] });
        return summoners;
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

export const startCheckLoop = () => {
    checkElo();
    setInterval(checkElo, 1000 * 60 * 15);
};

const checkElo = async () => {
    const em = getOrm().em.fork();
    const summoners = await em.find(Summoner, {});
    console.log("checking elo for summoners: ", summoners.map((s) => s.currentName).join(", "));

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

        const elo = await galeforce.lol.league
            .entries()
            .summonerId(summoner.summonerId)
            .region(galeforce.region.lol.EUROPE_WEST)
            .exec();

        const rank = em.create(Rank, {
            summoner: summoner,
            tier: elo[0].tier,
            leaguePoints: elo[0].leaguePoints,
            rank: elo[0].rank,
        });

        em.persist(rank);
    }

    await em.flush();
};
