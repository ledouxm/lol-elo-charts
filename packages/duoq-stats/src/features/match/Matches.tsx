import { Box, Button } from "@mui/material";
import { useInfiniteQuery } from "@tanstack/react-query";
import type Galeforce from "galeforce";
import { useState } from "react";
import { api, type DuoqStats, type MatchesResponse } from "../api";
import { MatchDetails } from "./MatchDetails";
import { MatchPreview } from "./MatchPreview";

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
            {infiniteMatchesQuery.hasNextPage ? (
                <Box my={2} display="flex" justifyContent="center">
                    <Button
                        loading={infiniteMatchesQuery.isFetchingNextPage}
                        variant="contained"
                        color="primary"
                        sx={{ bgcolor: "#BEBEBE" }}
                        onClick={() => infiniteMatchesQuery.fetchNextPage()}
                    >
                        Load more
                    </Button>
                </Box>
            ) : null}
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
