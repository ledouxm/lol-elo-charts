import { PlayerList } from "@/components/PlayerList";
import { useRoomList, useRoomState } from "@/hooks/useRoomState";
import { useSocketClient } from "@/hooks/useSocketClient";
import { RoomCard } from "@/monitor/RoomCard";
import { Box, Button, Center, Input, SimpleGrid, Stack } from "@chakra-ui/react";
import { getRandomString } from "@pastable/core";
import { useAtomValue } from "jotai/utils";
import { useEffect, useRef } from "react";
import { observedRoomNameAtom, RoomListTable } from "./RoomListTable";

export const RoomMonitor = () => {
    const name = useAtomValue(observedRoomNameAtom);
    const roomClient = useSocketClient();

    useEffect(() => {
        roomClient.rooms.list();
    }, []);

    return (
        <Stack w="100%">
            <Center flexDir="column" m="8">
                <RoomControls />
            </Center>
            <div>
                <Box w="50%" m="auto">
                    <RoomListTable />
                </Box>
            </div>
            {name && <RoomPlayerList key={name} name={name} />}
        </Stack>
    );
};

const RoomControls = () => {
    const client = useSocketClient();

    const createRoom = () => client.rooms.create(inputRef.current.value);
    const joinRoom = () => client.rooms.join(inputRef.current.value);

    const inputRef = useRef<HTMLInputElement>();

    return (
        <Stack>
            <Stack direction="row">
                <Button onClick={createRoom}>New room</Button>
                <Button onClick={() => client.rooms.create(getRandomString())}>New random room</Button>
            </Stack>
            <Stack direction="row">
                <Stack direction="row">
                    <Input ref={inputRef} defaultValue="oui" />
                    <Button onClick={joinRoom}>Join room</Button>
                </Stack>
            </Stack>
        </Stack>
    );
};

const RoomCardGrid = () => {
    const roomList = useRoomList();
    return (
        <SimpleGrid columns={[1, 1, 2, 3, 3, 4]} w="100%" spacing="8">
            {roomList.map((room) => (
                <RoomCard key={room.name} availableRoom={room} />
            ))}
        </SimpleGrid>
    );
};

const RoomPlayerList = ({ name }) => {
    const room = useRoomState(name);
    return <PlayerList list={room.clients} />;
};
