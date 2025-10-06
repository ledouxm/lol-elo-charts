import { useQuery } from "@tanstack/react-query";
import { getRouteApi, Route, RouteApi } from "@tanstack/react-router";
import { api } from "./api";
import type Galeforce from "galeforce";

const route = getRouteApi("/duoq");
export const useDuoqDataQueryWithParams = () => {
    const { summoner1, summoner2 } = route.useSearch();

    return useQuery({
        queryKey: ["duoqData", summoner1, summoner2],
        queryFn: () => api.getDuoqStats(summoner1, summoner2),
    });
};

export type Participant = Galeforce.dto.MatchDTO["info"]["participants"][number];
