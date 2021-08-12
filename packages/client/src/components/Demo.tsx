import { usePresence, useYAwareness, yDoc } from "@/functions/store";
import { getRandomColor, getSaturedColor, makeEmptyGame } from "@/functions/utils";
import { useSocketConnection, useSocketEvent } from "@/hooks/useSocketConnection";
import { getStateValuePath, useSharedMachine } from "@/lib";
import { getDemoMachine } from "@/machines/demoMachine";
import { getRpsMachine } from "@/machines/rpsMachine";
import { Game, Player, Room } from "@/types";
import {
    Box,
    Button,
    Center,
    chakra,
    Circle,
    CloseButton,
    Editable,
    EditableInput,
    EditablePreview,
    EditableProps,
    Flex,
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
                    <Button onClick={createRoom}>New room</Button>
                </Stack>
            </Center>
            <SimpleGrid columns={[1, 1, 2, 3, 3, 4]} w="100%" spacing="8">
                {roomsList.map((room, index) => (
                    <GameRoom key={room.id} room={rooms[index]} rooms={rooms} />
                ))}
            </SimpleGrid>
            <PlayerList />
            <RpsGames />
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
    const [state, send, , sendAndEmit] = useSharedMachine(() => getDemoMachine(initialCtx), {
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

const RpsGames = () => {
    const games = useYArray<Game>(yDoc, "games");
    const snap = useSnapshot(games);

    const makeNewGame = () => games.push(makeEmptyGame());

    return (
        <Stack>
            <Center mb="8">
                <Button onClick={makeNewGame}>New RPS game</Button>
            </Center>
            <SimpleGrid columns={[1, 1, 2, 3, 3, 4]} w="100%" spacing="8">
                {snap.map((item, index) => (
                    <DuelGameWidget key={item.id} game={games[index]} />
                ))}
            </SimpleGrid>
        </Stack>
    );
};

const DuelGameWidget = ({ game }: { game: Game }) => {
    const snap = useSnapshot(game);
    const [hostPlayer, opponentPlayer] = snap.players || [];

    const games = useYArray<Game>(yDoc, "games");
    const deleteGame = () => removeItemMutate(games, "id", game.id);
    const [presence] = usePresence();
    const joinGame = () => game.players.push(presence);
    const isHost = presence.id === hostPlayer?.id;

    // const rps = useYMap(yDoc, "rps." + game.id);
    const [storeId] = useState(() => "statemachine." + game.id);

    const [initialCtx] = useState(() => ({ game }));
    const [state, send, , sendAndEmit] = useSharedMachine(() => getRpsMachine(initialCtx), {
        context: initialCtx,
        yDoc,
        storeId,
        proxyKeys: ["game"],
    });
    console.log(state.context);

    const start = () => {};
    const play = (move) => sendAndEmit({ type: "PLAY", data: { move, id: presence.id } });

    const players = state.context.game.players;
    const player = findBy(players, "id", presence.id);
    const status = player?.status;
    // const markAsDone = () => sendAndEmit("MARK_DONE");
    // useSocketEvent("PLAY", () => send("PLAY"));

    return (
        <Flex bgColor="gray.400" w="100%" h="200px" p="15px" rounded={8} pos="relative">
            {<CloseButton pos="absolute" bottom="100%" left="100%" bgColor="gray.100" onClick={deleteGame} />}
            <PlayerSlot>
                {hostPlayer ? <PlayerSlotContent player={hostPlayer} /> : <PlayerSlotJoinGame onJoin={joinGame} />}
            </PlayerSlot>
            <Center w="80px" flexShrink={0}>
                <Stack alignItems="center">
                    <chakra.span>{getStateValuePath(state)}</chakra.span>
                    <VsCircle />
                    {state.matches("waiting") && state.context.game.players.length === 2 && (
                        <Button colorScheme="twitter" onClick={start}>
                            Start
                        </Button>
                    )}
                    {state.matches("playing") && (
                        <>
                            <Button colorScheme="orange" onClick={() => play("rock")} disabled={status === "moved"}>
                                Rock
                            </Button>
                            <Button colorScheme="pink" onClick={() => play("paper")} disabled={status === "moved"}>
                                Paper
                            </Button>
                            <Button colorScheme="teal" onClick={() => play("scissors")} disabled={status === "moved"}>
                                Scissors
                            </Button>
                        </>
                    )}
                </Stack>
            </Center>
            <PlayerSlot>
                {opponentPlayer ? (
                    <PlayerSlotContent player={opponentPlayer} />
                ) : isHost ? (
                    <PlayerSlotWaitingForOpponent />
                ) : (
                    <PlayerSlotJoinGame onJoin={joinGame} />
                )}
            </PlayerSlot>
        </Flex>
    );
};

const PlayerSlot = ({ children }) => (
    <Box w="100%" bgColor="gray.600" rounded={8}>
        {children}
    </Box>
);

const PlayerSlotContent = ({ player }: { player: Player }) => {
    return (
        <Stack justifyContent="center" alignItems="center" h="100%" spacing="1">
            <Circle size={"65px"} bgColor="gray.300" />
            <chakra.span textTransform="uppercase" color="gray.300">
                {player.username}
            </chakra.span>
            <chakra.span textTransform="uppercase" color="gray.300" fontSize="small">
                {1000} ELO
            </chakra.span>
        </Stack>
    );
};

const PlayerSlotJoinGame = ({ onJoin }) => {
    return (
        <Center h="100%">
            <Button colorScheme="yellow" onClick={onJoin}>
                Join game
            </Button>
        </Center>
    );
};

const PlayerSlotWaitingForOpponent = () => {
    return (
        <Center h="100%" maxW="135px">
            <Button colorScheme="yellow" disabled h="50px" mx="4" fontSize="sm">
                Waiting for
                <br /> an opponent...
            </Button>
        </Center>
    );
};

const VsCircle = () => (
    <Circle size={"40px"} bgColor="gray.300">
        <chakra.span textTransform="uppercase" color="gray.900" fontSize="small">
            VS
        </chakra.span>
    </Circle>
);

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
