import { Chat } from "@/chat/Chat";
import { PlayerList } from "@/components/PlayerList";
import { errorToast } from "@/functions/toasts";
import { useGameRoomRef } from "@/hooks/useGameRoomState";
import { useMyPresence } from "@/hooks/usePresence";
import { useRoomState, UseRoomStateReturn } from "@/hooks/useRoomState";
import { useRoutePath } from "@/hooks/useRoutePath";
import { useSocketClient } from "@/hooks/useSocketClient";
import { useSocketEvent, useSocketEventEmitter } from "@/hooks/useSocketConnection";
import { PlatformerCanvas } from "@/platformer/features/PlatformerCanvas";
import { Player, Room } from "@/types";
import { Box, Button, Flex, Select, SimpleGrid, Stack } from "@chakra-ui/react";
import { findBy, getRandomString } from "@pastable/core";
import { atomWithStorage } from "jotai/utils";
import { createContext, useContext, useEffect, useState } from "react";
import { Route, Switch, useHistory, useParams } from "react-router-dom";
import { Game, GameList } from "./GameList";

export const roomNameAtom = atomWithStorage("platformer/room", "");
export const RoomContext = createContext(
    {} as LobbyRoomInterface & { history: Array<Vote>; votes: Array<Vote>; selected?: string }
);
export const useRoomContext = () => useContext(RoomContext);
export type LobbyRoomInterface = UseRoomStateReturn<LobbyRoomState>;

export const LobbyRoom = () => {
    const { name } = useParams<{ name?: string }>();
    const router = useHistory();
    const room = useRoomState<LobbyRoomState>(name);

    useSocketEvent(`rooms/notFound`, () => {
        errorToast({ title: `Room ${name} not found` });
        router.push("/app");
    });
    useSocketEvent(`rooms/leave#${name}`, () => router.push("/app"));
    useSocketEvent(`rooms/delete#${name}`, () => router.push("/app"));

    // Keep the history of votes so that the order is consistent
    const [history, setHistory] = useState<Array<Vote>>([]);
    useSocketEvent(`rooms/update:votes.*#${name}`, (gameId: string, _event, playerId) => {
        const formated = { gameId, playerId };
        setHistory((history) => [...history.filter((vote) => vote.playerId !== formated.playerId), formated]);
    });

    const me = useMyPresence();
    const voteForGame = (gameId: string) => room.update(gameId, "votes." + me.id);

    const votes = Object.entries(room.state.votes || {}).map(([playerId, gameId]) => ({
        gameId,
        playerId,
        color: findBy(room.clients, "id", playerId)?.color,
    }));
    const selected = room.state.selectedGame;

    const updateMode = (e) => room.update(e.target.value, "mode");
    const isRoomAdmin = me.id === room.state.admin;

    const client = useSocketClient();
    const emitter = useSocketEventEmitter();
    const path = useRoutePath();

    // TODO extract that out of this component since lobby (SimpleRoom) will not always need to create a GameRoom ?
    // Create game with the one selected & random name + update this room.state.game
    const makeGame = () => {
        const gameRoomName = getRandomString();
        emitter.once("games/create#" + gameRoomName, () => {
            room.update(gameRoomName, "gameRoom");
            router.push(router.location.pathname + "/platformer");
        });
        client.games.create(gameRoomName, room.state.selectedGame);
    };

    const game = useGameRoomRef(room.state.gameRoom);
    // Auto join game whenever the current room.state.gameRoom changes
    useEffect(() => {
        if (!room.state.gameRoom) return;
        if (game.ref.current.clients.find((client) => client.id === me.id)) return;

        client.emit("games.join#" + room.state.gameRoom);
        router.push(router.location.pathname + "/platformer");
    }, [room.state.gameRoom]);

    return (
        <Stack>
            <RoomContext.Provider value={{ ...room, history, votes, selected }}>
                <Stack direction="row">
                    <BackButton />
                    {!room.isIn && <Button onClick={room.join}>Join {room.name}</Button>}
                </Stack>

                <SimpleGrid columns={[1, 2]}>
                    <Stack>
                        <Stack direction="row">
                            <Box>Room {room.name}</Box>
                            <Box>{room.clients.length} players</Box>
                        </Stack>
                        <Stack direction="row">
                            <Select
                                placeholder="Mode"
                                maxW="200px"
                                onChange={updateMode}
                                isDisabled={!isRoomAdmin}
                                value={room.state.mode}
                            >
                                <option value="democracy">Democracy</option>
                                <option value="anarchy">Anarchy</option>
                                <option value="monarchy">Monarchy</option>
                            </Select>
                            {isRoomAdmin && (
                                <Button onClick={makeGame} isDisabled={!room.state.selectedGame}>
                                    make game
                                </Button>
                            )}
                        </Stack>
                    </Stack>
                    <Box>
                        <pre>{JSON.stringify(room.state, null, 4)}</pre>
                    </Box>
                </SimpleGrid>
                <Box w="50%">
                    <Flex direction="column" minH="0" flex="1 1 auto" overflow="auto">
                        <Chat />
                    </Flex>
                </Box>
                <Switch>
                    <Route
                        path={path + "/platformer"}
                        children={<PlatformerCanvas h="100vh" gameName={room.state.gameRoom} />}
                    />
                    <Route path={path + "/"} children={<GameList onClick={voteForGame} />} />
                </Switch>
            </RoomContext.Provider>
            <PlayerList list={room.clients} />
        </Stack>
    );
};

export interface LobbyRoomState {
    admin: string;
    selectedGame?: string;
    votes: Record<Player["id"], Game["id"]>;
    mode: "democracy" | "anarchy" | "monarchy";
    gameRoom: Room["name"];
}

export interface Vote {
    gameId: Game["id"];
    playerId: Player["id"];
    color?: string;
}

const BackButton = () => {
    const room = useContext(RoomContext);
    const history = useHistory();

    const leave = () => {
        room.leave();
        history.push("/app/");
    };

    return <Button onClick={leave}>Back</Button>;
};
