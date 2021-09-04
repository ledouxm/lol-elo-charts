import { getSaturedColor } from "@/functions/utils";
import { usePresenceList, useMyPresence } from "@/hooks/usePresence";
import { Box, Center, chakra, Stack, Tooltip } from "@chakra-ui/react";
import { atomWithToggleAndStorage } from "@pastable/core";
import { useAtomValue } from "jotai/utils";

export const isPlayerListShownAtom = atomWithToggleAndStorage("platformer/isPlayerListShown");
export const PlayerList = () => {
    const players = usePresenceList();
    const me = useMyPresence();
    const isPlayerListShown = useAtomValue(isPlayerListShownAtom);

    return (
        <Box pos="fixed" top="100px" right="0" display={isPlayerListShown ? "" : "none"}>
            <Stack alignItems="flex-end">
                {players.map((player) => (
                    <Box key={player.id} py="2" px="4" w="250px" bgColor={getSaturedColor(player.color)} pos="relative">
                        <Center
                            pos="absolute"
                            top="0"
                            right="100%"
                            h="100%"
                            w={me.id === player.id ? "30px" : "20px"}
                            bgColor={player.color}
                        ></Center>
                        <Tooltip label={<chakra.span fontSize="xx-small">({player.id})</chakra.span>}>
                            <chakra.span color="white" fontWeight="bold">
                                {player.username}
                            </chakra.span>
                        </Tooltip>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
};
