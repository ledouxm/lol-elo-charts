import { PlatformerCanvas } from "@/platformer/features/PlatformerCanvas";
import { Stack } from "@chakra-ui/react";
import { AppSocket } from "./AppSocket";

export const Demo = () => {
    return (
        <Stack w="100%" overflow="hidden">
            <AppSocket />
            <PlatformerCanvas h="100vh" />
        </Stack>
    );
};
