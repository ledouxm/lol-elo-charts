import { useQuery } from "@tanstack/react-query";
import { type Summoner } from "./api";
import { Box } from "@mui/material";
import { getDDVersion, getProfileIconUrl } from "@lol-elo-charts/shared/datadragon";

export const ProfileCard = ({ summoner, isRightSide }: { summoner: Summoner; isRightSide?: boolean }) => {
    const urlQuery = useQuery({
        queryKey: ["profile-icon", summoner.icon],
        queryFn: () => getProfileIconUrl(summoner.icon),
    });

    return (
        <Box display="flex" flexDirection={isRightSide ? "row-reverse" : "row"} alignItems="center" gap={2}>
            <Box
                component="img"
                sx={{ width: "60px", height: "60px", borderRadius: "50%" }}
                src={urlQuery.data}
                alt="Profile Icon"
                width={100}
                height={100}
            />
            <Box fontWeight="bold">{summoner.name}</Box>
        </Box>
    );
};
