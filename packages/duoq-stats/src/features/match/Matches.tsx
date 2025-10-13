import { Accordion, AccordionDetails, AccordionSummary, Box, LinearProgress, Typography } from "@mui/material";
import { useState } from "react";
import { api, type DuoqStats, type MatchesResponse } from "../api";
import { useInfiniteQuery } from "@tanstack/react-query";
import type Galeforce from "galeforce";
import { useDuoqDataQueryWithParams } from "../utils";
import { ChampionIconWithLevel } from "@/components/ChampionIconWithLevel";
import { MatchPreview } from "./MatchPreview";
import { MatchDetails } from "./MatchDetails";

export const Matches = ({ stats }: { stats: DuoqStats }) => {
    const infiniteMatchesQuery = useInfiniteQuery({
        queryKey: ["duoqMatches", stats.summoner1.puuid, stats.summoner2.puuid],
        queryFn: ({ pageParam }) => api.getMatches(stats.summoner1.puuid, stats.summoner2.puuid, pageParam),
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: undefined as string | undefined,
    });

    const pages = infiniteMatchesQuery.data?.pages || [];

    if (infiniteMatchesQuery.isLoading) return <div>Loading matches...</div>;
    if (infiniteMatchesQuery.isError) return <div>Error loading matches</div>;
    if (pages.length === 0) return <div>No matches found</div>;

    return (
        <Box width="100%">
            {pages.map((page, index) => (
                <MatchPage key={index} page={page} />
            ))}
        </Box>
    );
};

export const MatchPage = ({ page }: { page: MatchesResponse }) => {
    return (
        <>
            {page.matches.map((match) => (
                <MatchPanel key={match.metadata.matchId} match={match} />
            ))}
        </>
    );
};

const MatchPanel = ({ match }: { match: Galeforce.dto.MatchDTO }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Box width="100%" m={0.5}>
            <Box onClick={() => setIsOpen(!isOpen)} style={{ cursor: "pointer" }} width="100%">
                <MatchPreview match={match} />
            </Box>
            <Box width="100%" display={isOpen ? "block" : "none"}>
                <MatchDetails match={match} />
            </Box>
        </Box>
    );
};
