import { ofetch } from "ofetch";

import { ENV } from "../features/envVars";
import type Galeforce from "galeforce";

const client = ofetch.create({
    baseURL: ENV.VITE_API_URL + "/api",
});

export const api = {
    getDuoqStats: async (summoner1: string, summoner2: string) => {
        return client<DuoqStats>("/duoq", {
            method: "GET",
            params: {
                summoner1,
                summoner2,
            },
        });
    },
    getDuoqMatchIds: async (puuid1: string, puuid2: string, cursor?: string) => {
        return client<string[]>("/duoq/match-ids", {
            params: {
                puuid1,
                puuid2,
                cursor,
            },
        });
    },
    getMatches: async (puuid1: string, puuid2: string, cursor?: string) => {
        return client<MatchesResponse>("/duoq/matches", {
            params: {
                puuid1,
                puuid2,
                cursor,
            },
        });
    },
    getAvailableSummoners: async (str: string) => {
        return client<Summoner[]>("/available-summoners", {
            params: {
                str,
            },
        });
    },
};

const datadragonApiClient = ofetch.create({
    baseURL: "https://ddragon.leagueoflegends.com/",
});

const versionRef = {
    current: "" as string | null,
};

const getLatestVersion = async () => {
    if (versionRef.current) return versionRef.current;
    const versions = await datadragonApiClient<string[]>("/api/versions.json");
    versionRef.current = versions[0] || null;
    return versionRef.current;
};

export const getProfileIconUrl = async (iconId: number) => {
    await getLatestVersion();
    return `https://ddragon.leagueoflegends.com/cdn/${versionRef.current}/img/profileicon/${iconId}.png`;
};

export type DuoqStats = {
    summoner1: Summoner;
    summoner2: Summoner;
    duoqSummary: DuoqMatchSummary;
};

export type Summoner = {
    puuid: string;
    icon: number;
    name: string;
};

type DuoqMatchSummary = {
    totalMatches: number;
    wonTogether: number;
    p1WonAgainstP2: number;
    p2WonAgainstP1: number;
    playedAgainst: number;
    playedWith: number;
    matchIds: string[];
};

export type MatchesResponse = {
    matchIds: string[];
    matches: Galeforce.dto.MatchDTO[];
    nextCursor: string | null;
};
