import { Button, Center, Flex, Input, Stack } from "@chakra-ui/react";
import { getRandomString } from "@pastable/core";
import { useAtomValue } from "jotai/utils";
import { useEffect, useRef } from "react";

import { PlayerList } from "@/components/PlayerList";
import { useRoomState } from "@/socket/useRoomState";
import { useSocketClient } from "@/socket/useSocketClient";

import { RoomListTable, observedRoomNameAtom } from "./RoomListTable";

export const RoomMonitor = () => {
    const name = useAtomValue(observedRoomNameAtom);
    const client = useSocketClient();

    useEffect(() => {
        client.rooms.list();
    }, []);

    return (
        <Flex w="100%" direction="column">
            <Center flexDir="column" my="4">
                <RoomControls />
            </Center>
            <RoomListTable />
            {name && <RoomPlayerList key={name} name={name} />}
        </Flex>
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

const RoomPlayerList = ({ name }) => {
    const room = useRoomState(name);
    return <PlayerList list={room.clients} />;
};
