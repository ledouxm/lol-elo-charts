import { getChampionIconUrl } from "@lol-elo-charts/shared/datadragon";
import { Box, type BoxProps } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import type Galeforce from "galeforce";

export const ChampionIconWithLevel = ({
    champion,
    level,
    size,
    ...props
}: { champion: string; level: number; size?: number } & BoxProps) => {
    return (
        <Box position="relative" display="flex" alignItems={"center"}>
            <ChampionIcon champion={champion} size={size} {...props} />
            <Box
                position="absolute"
                bottom={0}
                right={0}
                bgcolor="background.paper"
                color="text.primary"
                borderRadius="0px"
                width={16}
                height={16}
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="12px"
            >
                {level}
            </Box>
        </Box>
    );
};

export const ChampionIcon = ({ champion, size = 32, ...props }: { champion: string; size?: number } & BoxProps) => {
    const urlQuery = useQuery({
        queryKey: ["champion-icon", champion],
        queryFn: () => getChampionIconUrl(champion),
    });

    return (
        <Box
            component="img"
            {...props}
            sx={{ width: size, height: size, ...props.sx }}
            src={urlQuery.data}
            alt={champion}
        />
    );
};

type a = Galeforce.dto.MatchDTO["info"]["participants"][0]["championId"];
