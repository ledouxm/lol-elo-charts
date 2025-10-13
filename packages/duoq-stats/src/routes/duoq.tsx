import { type DuoqStats } from "@/features/api";
import { DuoqForm } from "@/features/DuoqForm";
import { Matches } from "@/features/match/Matches";
import { ProfileCard } from "@/features/ProfileCard";
import { useDuoqDataQueryWithParams } from "@/features/utils";
import { Box } from "@mui/material";
import { createFileRoute, redirect } from "@tanstack/react-router";

type DuoqParams = {
    summoner1: string;
    summoner2: string;
};

export const Route = createFileRoute("/duoq")({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>) => {
        const { summoner1, summoner2 } = search as DuoqParams;

        return {
            summoner1: typeof summoner1 === "string" ? summoner1 : "",
            summoner2: typeof summoner2 === "string" ? summoner2 : "",
        };
    },
    beforeLoad: ({ search }) => {
        const { summoner1, summoner2 } = search as DuoqParams;
        if (!summoner1 || !summoner2) {
            throw redirect({ to: "/" });
        }
    },
});

function RouteComponent() {
    const { summoner1, summoner2 } = Route.useSearch();
    const duoqDataQuery = useDuoqDataQueryWithParams();

    return (
        <Box display="flex" flexDirection="column" width="850px" color="white">
            <Box display="flex" justifyContent="center" mt="20px" width="100%">
                <DuoqForm defaultValues={{ summoner1, summoner2 }} isInline />
            </Box>

            <Box flex="1" display="flex" justifyContent="center" mt="40px">
                {duoqDataQuery.isLoading ? <div>Loading...</div> : null}
                {duoqDataQuery.isError ? <div>Error loading data</div> : null}
                {duoqDataQuery.data ? <Stats stats={duoqDataQuery.data} /> : null}
            </Box>
        </Box>
    );
}

const Stats = ({ stats }: { stats: DuoqStats }) => {
    console.log(stats);
    return (
        <Box
            display="flex"
            width="100%"
            flexDirection="column"
            gap={2}
            alignItems="center"
            bgcolor="background.default"
            p={4}
            borderRadius={4}
            boxShadow={1}
        >
            <Box display="flex" flexDirection="row" gap={16} width="100%" justifyContent="space-between">
                <ProfileCard summoner={stats.summoner1} />
                <ProfileCard summoner={stats.summoner2} isRightSide />
            </Box>

            {/* <Box width="400px" textAlign="center">
                <Box display={stats.duoqSummary.playedWith === 0 ? "none" : "block"}>
                    <Typography>
                        As allies: {stats.duoqSummary.playedWith} game{stats.duoqSummary.playedWith !== 1 ? "s" : ""} (
                        {stats.duoqSummary.wonTogether} won)
                    </Typography>
                    <LinearProgress
                        color="success"
                        sx={{ height: "20px" }}
                        variant="determinate"
                        value={(stats.duoqSummary.wonTogether / stats.duoqSummary.playedWith) * 100}
                    />
                </Box>
                <Box mt="16px" display={stats.duoqSummary.playedAgainst === 0 ? "none" : "block"}>
                    <Typography>
                        As enemies: {stats.duoqSummary.playedAgainst} game
                        {stats.duoqSummary.playedAgainst !== 1 ? "s" : ""}
                    </Typography>
                    <LinearProgress
                        color="error"
                        sx={{ height: "20px" }}
                        variant="determinate"
                        value={(stats.duoqSummary.p1WonAgainstP2 / stats.duoqSummary.playedAgainst) * 100}
                    />
                </Box>
                <Box
                    display={
                        stats.duoqSummary.playedAgainst === 0 && stats.duoqSummary.playedWith === 0 ? "block" : "none"
                    }
                >
                    Never played together
                </Box>
            </Box> */}

            <Matches stats={stats} />
        </Box>
    );
};
