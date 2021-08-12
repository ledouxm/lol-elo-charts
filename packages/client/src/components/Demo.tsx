import { usePresence, useYAwareness, yDoc } from "@/functions/store";
import { getRandomColor, getSaturedColor } from "@/functions/utils";
import { useSocketConnection, useSocketSend } from "@/hooks/useSocketConnection";
import { Player, Room } from "@/types";
import {
    Box,
    Button,
    Center,
    chakra,
    Editable,
    EditableInput,
    EditablePreview,
    EditableProps,
    SimpleGrid,
    Spinner,
    Stack,
} from "@chakra-ui/react";
import { findBy, getRandomString, removeItemMutate } from "@pastable/core";
import { useYArray } from "jotai-yjs";
import { useSnapshot } from "valtio";

const makeRoom = () => ({ id: getRandomString(), clients: [] });

export const Demo = () => {
    // Connect to websocket / try to reconnect on focus while not connected / debug in dev
    useSocketConnection();

    const [presence, setPresence] = usePresence();
    const updateRandomColor = () => setPresence((player) => ({ ...player, color: getRandomColor() }));

    const rooms = useYArray<Room>(yDoc, "rooms");
    const roomsList = useSnapshot(rooms);

    const createRoom = () => rooms.push(makeRoom());
    const joinRoom = (room: Room) => room.clients.push(presence);
    const leaveRoom = (room: Room) => removeItemMutate(room.clients, "id", presence.id);
    const removeRoom = (room: Room) => removeItemMutate(rooms, "id", room.id);

    const send = useSocketSend();
    const sendMsg = () => send("yes", getRandomString());

    // const inputRef = useRef<HTMLInputElement>();

    if (!presence) {
        return (
            <Center>
                <Spinner />
            </Center>
        );
    }
    console.log(roomsList);

    return (
        <Stack w="100%">
            <Center flexDir="column" m="8">
                <Stack h="100%">
                    <Stack direction="row" alignItems="center">
                        <chakra.span>(Editable) Username: </chakra.span>
                        <PresenceName />
                    </Stack>
                    <Button onClick={updateRandomColor}>Random color</Button>
                    <Button onClick={createRoom}>New game</Button>
                    <Button onClick={sendMsg}>Send msg</Button>
                </Stack>
            </Center>
            <SimpleGrid columns={[1, 1, 2, 3, 3, 4]} w="100%" spacing="8">
                {roomsList.map((room, index) => (
                    <Stack key={room.id} border="1px solid teal">
                        <span>id: {room.id}</span>
                        <span>clients: {room.clients.map((client) => client.username).toString()}</span>
                        {!Boolean(findBy(room.clients, "id", presence.id)) && (
                            <Button onClick={() => joinRoom(rooms[index])}>Join</Button>
                        )}
                        <Button onClick={() => leaveRoom(rooms[index])}>Leave</Button>
                        <Button onClick={() => removeRoom(rooms[index])}>Remove</Button>
                    </Stack>
                ))}
            </SimpleGrid>
            <PlayerList />
        </Stack>
    );
};

const PlayerList = () => {
    const awareness = useYAwareness();
    const players = Array.from(awareness.entries()).filter(([_id, player]) => player.id);

    return (
        <Box pos="fixed" top="100px" right="0">
            <Stack>
                {players.map(([id, presence]) => (
                    <Box key={id} py="2" px="4" w="150px" bgColor={presence.color} pos="relative">
                        <Box
                            pos="absolute"
                            top="0"
                            right="100%"
                            h="100%"
                            w="20px"
                            bgColor={getSaturedColor(presence.color)}
                        />
                        <chakra.span color="black">{presence.username}</chakra.span>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
};

const PresenceName = () => {
    const [presence, setPresence] = usePresence();

    const updateName = (username: Player["username"]) => setPresence((player) => ({ ...player, username }));
    return <EditableName defaultValue={presence.username} onSubmit={updateName} />;
};

const EditableName = (props: EditableProps) => {
    return (
        <Editable {...props}>
            <EditablePreview />
            <EditableInput w="12ch" textAlign="center" />
        </Editable>
    );
};
