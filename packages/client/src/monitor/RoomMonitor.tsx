import { LobbyRoomDemo } from "@/components/LobbyRoomDemo";
import { PlayerList } from "@/components/PlayerList";
import { PresenceName } from "@/components/PresenceName";
import { successToast } from "@/functions/toasts";
import { getRandomColor } from "@/functions/utils";
import { useUpdatePresence } from "@/hooks/usePresence";
import { useRoomList } from "@/hooks/useRoomState";
import { useSocketClient } from "@/hooks/useSocketClient";
import { useSocketEventEmitter } from "@/hooks/useSocketConnection";
import { AvailableRoom, Player } from "@/types";
import { Button, Center, chakra, Input, SimpleGrid, Stack, useColorMode } from "@chakra-ui/react";
import { getRandomString } from "@pastable/core";
import { useRef } from "react";

// TODO proxy+permission xxx.push() emit/throw etc
const initialRoomState = { status: "waiting" };

export const RoomMonitor = () => {
    const setPresence = useUpdatePresence();
    const updateRandomColor = () => setPresence((player) => ({ ...player, color: getRandomColor() }));

    const client = useSocketClient();
    const emitter = useSocketEventEmitter();

    const createRoom = () => client.rooms.create(inputRef.current.value, { initialState: initialRoomState });
    const joinRoom = () => client.rooms.join(inputRef.current.value);

    const roomList = useRoomList();
    const inputRef = useRef<HTMLInputElement>();
    const { toggleColorMode } = useColorMode();

    return (
        <Stack w="100%">
            <Center flexDir="column" m="8">
                <SimpleGrid columns={[1, 1, 2]} spacing="8">
                    <Stack>
                        <Button onClick={toggleColorMode}>Toggle color mode</Button>
                        <Stack direction="row" alignItems="center">
                            <Button onClick={updateRandomColor}>Random color</Button>
                            <chakra.span>Username: </chakra.span>
                            <PresenceName />
                        </Stack>
                        <Stack direction="row">
                            <Button onClick={createRoom}>New room</Button>
                            <Button onClick={() => client.rooms.create(getRandomString())}>New random room</Button>
                            <Button
                                onClick={() => {
                                    client.rooms.list();
                                    emitter.once("rooms/list", (rooms: Array<AvailableRoom>) =>
                                        successToast({
                                            title: "list",
                                            description: rooms.map((room) => room.name).toString(),
                                        })
                                    );
                                }}
                            >
                                List rooms
                            </Button>
                        </Stack>
                        <Stack direction="row">
                            <Stack direction="row">
                                <Input ref={inputRef} defaultValue="oui" />
                                <Button onClick={joinRoom}>Join room</Button>
                            </Stack>
                        </Stack>
                    </Stack>
                    <Stack>
                        <Stack direction="row">
                            <Button onClick={() => client.presence.update({ username: getRandomString() })}>
                                Presence update
                            </Button>
                            <Button
                                onClick={() => {
                                    client.presence.list();
                                    emitter.once("presence/list", (players: Array<Player>) =>
                                        successToast({
                                            title: "list",
                                            description: players.map((room) => room.username).toString(),
                                        })
                                    );
                                }}
                            >
                                Presence list
                            </Button>
                        </Stack>
                        <Stack direction="row">
                            <Button onClick={() => client.broadcast([getRandomString()])}>Broadcast</Button>
                            <Button onClick={() => client.relay([getRandomString()])}>Relay</Button>
                        </Stack>
                    </Stack>
                </SimpleGrid>
            </Center>
            <SimpleGrid columns={[1, 1, 2, 3, 3, 4]} w="100%" spacing="8">
                {roomList.map((room) => (
                    <LobbyRoomDemo key={room.name} availableRoom={room} />
                ))}
            </SimpleGrid>
            <PlayerList />
        </Stack>
    );
};
