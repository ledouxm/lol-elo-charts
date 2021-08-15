import { getSaturedColor } from "@/functions/utils";
import { usePresenceList, initialPresence } from "@/hooks/usePresence";
import { Box, Center, chakra, Stack } from "@chakra-ui/react";

export const PlayerList = () => {
    const players = usePresenceList();

    return (
        <Box pos="fixed" top="100px" right="0">
            <Stack alignItems="flex-end">
                {players.map((player) => (
                    <Box key={player.id} py="2" px="4" w="250px" bgColor={getSaturedColor(player.color)} pos="relative">
                        <Center
                            pos="absolute"
                            top="0"
                            right="100%"
                            h="100%"
                            w={initialPresence.id === player.id ? "30px" : "20px"}
                            bgColor={player.color}
                        ></Center>
                        <chakra.span color="white" fontWeight="bold">
                            {player.username}
                        </chakra.span>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
};
