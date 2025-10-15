import { SummonerAutocomplete } from "@/features/DuoqForm";
import { SummonerLiveGame } from "@/features/SummonerLiveGame";
import { Box, Button, Input, Typography } from "@mui/material";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

export const Route = createFileRoute("/live")({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>) => {
        const { summoner } = search as { summoner: string };
        if (!summoner) {
            return {};
        }

        return {
            summoner: typeof summoner === "string" ? summoner : "",
        };
    },
});

function RouteComponent() {
    const { summoner } = Route.useSearch();

    return (
        <Box
            color="white"
            display={"flex"}
            flexDirection="column"
            alignItems="center"
            justifyContent={summoner ? "flex-start" : "center"}
            height="100%"
            gap={2}
            mt="20px"
        >
            <SummonerForm />
            {summoner ? <SummonerLiveGame summoner={summoner} /> : null}
        </Box>
    );
}

const SummonerForm = () => {
    const { summoner } = Route.useSearch();
    const form = useForm({ defaultValues: { summoner } });
    const navigate = Route.useNavigate();

    return (
        <Box
            component="form"
            display="flex"
            alignItems="center"
            p={4}
            borderRadius={4}
            boxShadow={2}
            bgcolor="background.default"
            onSubmit={form.handleSubmit((data) => {
                if (data.summoner) {
                    navigate({ search: { summoner: data.summoner } });
                }
            })}
        >
            <Box>
                <Typography color="white" variant="h1" fontSize="16px" mb={3} fontWeight="bold">
                    Live game
                </Typography>
                <Box width="400px">
                    <SummonerAutocomplete form={form} name="summoner" />
                </Box>
                <Box display="flex" justifyContent="center" mt={3}>
                    <Button variant="contained" color="primary" type="submit" sx={{ bgcolor: "white" }}>
                        Search
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};
