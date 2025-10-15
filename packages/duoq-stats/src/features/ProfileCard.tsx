import { useQuery } from "@tanstack/react-query";
import { type Summoner } from "./api";
import { Box } from "@mui/material";
import { getDDVersion, getProfileIconUrl } from "@lol-elo-charts/shared/datadragon";

export const ProfileCard = ({
    summoner,
    isRightSide,
    small,
}: {
    summoner: Summoner;
    isRightSide?: boolean;
    small?: boolean;
}) => {
    const urlQuery = useQuery({
        queryKey: ["profile-icon", summoner.icon],
        queryFn: () => getProfileIconUrl(summoner.icon),
    });

    const size = small ? 40 : 60;

    return (
        <Box display="flex" flexDirection={isRightSide ? "row-reverse" : "row"} alignItems="center" gap={2}>
            <Box
                component="img"
                sx={{ width: `${size}px`, height: `${size}px`, borderRadius: "50%" }}
                src={urlQuery.data}
                alt="Profile Icon"
            />
            <Box fontWeight="bold" fontSize={small ? "12px" : undefined}>
                {summoner.name}
            </Box>
        </Box>
    );
};
