import { makeDebug } from "@/utils";
import express from "express";
import { galeforce, getSummonerByName } from "../summoner";
import { getDuoqMatchSummary, getSummonerPuuidFromDb, getSummonerPuuidFromDbWithFallback } from "./duoq";
import { db } from "@/db/db";
import { summoner } from "@/db/schema";
import { eq } from "drizzle-orm";
import { LolApi } from "twisted";
import { ENV } from "@/envVars";
import type { CurrentGameInfoDTO } from "galeforce/dist/galeforce/interfaces/dto";
import { AxiosError } from "axios";

const lolApi = new LolApi({
    key: ENV.RG_API_KEY,
});

const debug = makeDebug("live-router");

export const liveRouter = express.Router();

liveRouter.get("/live", async (req, res) => {
    try {
        const { summoner: summonerName } = req.query;
        if (!summonerName) {
            return res.status(400).json({ error: "summoner is required" });
        }

        const summonerData = await getSummonerPuuidFromDbWithFallback(summonerName as string);

        const data = await lolApi.SpectatorV5.activeGame(summonerData.puuid, "EUW1" as any);
        console.log(data);
        if (!data || !data.response) {
            return res.status(404).json({ error: "No live game found" });
        }

        const currentGameInfo = data.response as CurrentGameInfoDTO;
        const participants = [] as (CurrentGameInfoDTO["participants"][number] & {
            duoqMatchSummary: Awaited<ReturnType<typeof getDuoqMatchSummary>>;
        })[];
        for (const participant of currentGameInfo.participants) {
            if ((participant as any).puuid === summonerData.puuid) {
                participants.push({ ...participant, duoqMatchSummary: null });
                continue;
            }
            const duoqMatchSummary = await getDuoqMatchSummary(summonerData.puuid, (participant as any).puuid);
            participants.push({ ...participant, duoqMatchSummary });
        }

        res.json({ ...currentGameInfo, participants });
    } catch (error) {
        if ((error as any)?.status === 404) {
            return res.status(404).json({ error: "No live game found" });
        }
        res.status(500).json({ error: "Error fetching live game data" });
    }
});
