import { useMyPresence } from "@/hooks/usePresence";
import { useRoomState } from "@/hooks/useRoomState";
import { useSocketEvent } from "@/hooks/useSocketConnection";
import { Player } from "@/types";
import { Box, Button, Select, Stack } from "@chakra-ui/react";
import { findBy, ObjectLiteral } from "@pastable/core";
import { atomWithStorage } from "jotai/utils";
import { createContext, useContext, useState } from "react";
import { Game, GameList } from "./GameList";
import { getMostOcurrence } from "@/functions/utils";
import { useHistory, useParams } from "react-router-dom";
import { errorToast } from "@/functions/toasts";

export const roomNameAtom = atomWithStorage("platformer/room", "");
export const RoomContext = createContext(
    {} as ReturnType<typeof useRoomState> & { history: Votes; votes: Votes; selected?: string }
);

export const LobbyRoom = () => {
    const { name } = useParams<{ name?: string }>();
    const router = useHistory();
    const room = useRoomState<RoomState>(name);

    console.log(room);

    useSocketEvent(`rooms/notFound`, () => {
        errorToast({ title: `Room ${name} not found` });
        router.push("/");
    });
    useSocketEvent(`rooms/leave#${name}`, () => router.push("/"));
    useSocketEvent(`rooms/delete#${name}`, () => router.push("/"));

    // Keep the history of votes so that the order is consistent
    const [history, setHistory] = useState<Votes>([]);
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

    return (
        <Stack>
            <RoomContext.Provider value={{ ...room, history, votes, selected }}>
                <BackButton />
                <Stack direction="row">
                    <Box>Room {room.name}</Box>
                    <Box>{room.clients.length} players</Box>
                </Stack>
                <Select placeholder="Mode" maxW="200px" onChange={updateMode} isDisabled={!isRoomAdmin}>
                    <option value="democracy">Democracy</option>
                    <option value="anarchy">Anarchy</option>
                    <option value="monarchy">Monarchy</option>
                </Select>
                <Box>
                    <pre>{JSON.stringify(room.state, null, 4)}</pre>
                </Box>
                <GameList onClick={voteForGame} />
            </RoomContext.Provider>
        </Stack>
    );
};

export interface RoomState {
    admin: string;
    selectedGame?: string;
    votes: Record<Player["id"], Game["id"]>;
}

const getVoteKey = (payload: ObjectLiteral) => Object.keys(payload).find((key) => key.startsWith("votes."));

export interface Vote {
    gameId: Game["id"];
    playerId: Player["id"];
    color?: string;
}
export type Votes = Vote[];

const BackButton = () => {
    const room = useContext(RoomContext);
    const history = useHistory();

    const leave = () => {
        room.leave();
        history.push("/");
    };

    return <Button onClick={leave}>Back</Button>;
};
