import { Stack } from "@chakra-ui/react";
import { RoomSelection } from "../room/RoomPage";
import { AppDevTools } from "./AppDevTools";
import { PlayerList } from "./PlayerList";

export const Demo = () => {
    return (
        <Stack w="100%" overflow="hidden">
            {/* <PlatformerCanvas h="100vh" /> */}
            <PlayerList />
            <RoomSelection />
            <AppDevTools />
        </Stack>
    );
};
