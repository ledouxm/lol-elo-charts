import { usePresence, useYAwareness, yDoc } from "@/functions/store";
import { getRandomColor, getSaturedColor } from "@/functions/utils";
import { useSocketConnection, useSocketEvent } from "@/hooks/useSocketConnection";
import { getStateValuePath, useSyncedMachine } from "@/lib";
import { getDemoMachine } from "@/machines/demoMachine";
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
import { useYArray, useYMap } from "jotai-yjs";
import { useState } from "react";
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

    if (!presence) {
        return (
            <Center>
                <Spinner />
            </Center>
        );
    }

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
                </Stack>
            </Center>
            <SimpleGrid columns={[1, 1, 2, 3, 3, 4]} w="100%" spacing="8">
                {roomsList.map((room, index) => (
                    <GameRoom key={room.id} room={rooms[index]} rooms={rooms} />
                ))}
            </SimpleGrid>
            <PlayerList />
        </Stack>
    );
};

const GameRoom = ({ room, rooms }: { room: Room; rooms: Array<Room> }) => {
    const snap = useSnapshot(room);
    const [presence] = usePresence();

    const joinRoom = () => room.clients.push(presence);
    const leaveRoom = () => removeItemMutate(room.clients, "id", presence.id);
    const removeRoom = () => removeItemMutate(rooms, "id", room.id);

    const game = useYMap(yDoc, "game." + room.id);
    const [storeId] = useState(() => "statemachine." + room.id);

    const [initialCtx] = useState(() => ({ game, room }));
    const [state, send, , sendAndEmit] = useSyncedMachine(() => getDemoMachine(initialCtx), {
        context: initialCtx,
        yDoc,
        storeId,
        proxyKeys: ["game", "room"],
    });

    const play = () => sendAndEmit("PLAY", true);
    const markAsDone = () => sendAndEmit("MARK_DONE");
    useSocketEvent("PLAY", () => send("PLAY"));

    const applyCtx = () => send("APPLY_CTX");

    return (
        <Stack border="1px solid teal">
            <Stack direction="row">
                <span>id: {snap.id}</span>
                <span>state: {getStateValuePath(state)}</span>
                <span>ctx isDone: {state.context.game.mark ? "done" : "empty"}</span>
            </Stack>
            <span>ctx clients: {state.context.room.clients.map((client) => client.username).toString()}</span>
            {state.matches("waiting") &&
                (Boolean(findBy(state.context.room.clients, "id", presence.id)) ? (
                    <Button onClick={leaveRoom}>Leave</Button>
                ) : (
                    <Button onClick={joinRoom}>Join</Button>
                ))}
            <Button onClick={removeRoom}>Remove</Button>
            {state.matches("playing") && <Button onClick={markAsDone}>Mark as done</Button>}
            <Button onClick={play}>Play</Button>
            <Button onClick={applyCtx}>Apply ctx</Button>
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
