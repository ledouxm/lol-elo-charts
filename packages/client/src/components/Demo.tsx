import { PlatformerCanvas } from "@/platformer/features/PlatformerCanvas";
import { Stack } from "@chakra-ui/react";

export const Demo = () => {
    return (
        <Stack w="100%" overflow="hidden">
            <PlatformerCanvas h="100vh" />
        </Stack>
    );
};
