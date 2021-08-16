import { useMyPresence } from "@/hooks/usePresence";
import { useRoomState } from "@/hooks/useRoomState";
import { useSocketEvent } from "@/hooks/useSocketConnection";
import { Player } from "@/types";
import { Box, Stack } from "@chakra-ui/react";
import { findBy, ObjectLiteral } from "@pastable/core";
import { atomWithStorage, useAtomValue } from "jotai/utils";
import { createContext, useState } from "react";
import { BackButton } from "./components/BackButton";
import { Game, GameList } from "./GameList";
import { CreateGameForm, JoinGameForm } from "./RoomForms";

export const roomNameAtom = atomWithStorage("platformer/room", "");
export const RoomContext = createContext(
    {} as ReturnType<typeof useRoomState> & { history: Votes; votes: Votes; selected?: string }
);

export interface RoomState {
    admin: string;
    selectedGame?: string;
    votes: Record<Player["id"], Game["id"]>;
}

const getVoteKey = (payload: ObjectLiteral) => Object.keys(payload).find((key) => key.startsWith("votes."));

const formatVoteEvent = (payload: ObjectLiteral): Vote => {
    const key = getVoteKey(payload);

    return {
        gameId: payload[key],
        playerId: key.slice(6),
    };
};

const getMaxVoted = (gameIds: Game["id"][]) => {
    const b = {};
    let max = "";
    let maxi = 0;
    for (let k of gameIds) {
        if (b[k]) b[k]++;
        else b[k] = 1;
        if (maxi < b[k]) {
            max = k;
            maxi = b[k];
        }
    }
    return max;
};

export const Room = () => {
    const roomName = useAtomValue(roomNameAtom);
    const room = useRoomState<RoomState>(roomName);

    const [history, setHistory] = useState<Votes>([]);

    useSocketEvent(`rooms/update#${roomName}`, (payload: ObjectLiteral) => {
        const formated = formatVoteEvent(payload);
        setHistory((history) => [...history.filter((vote) => vote.playerId !== formated.playerId), formated]);
    });

    const me = useMyPresence();

    const selectGame = (gameId: string) => {
        room.update({ selectedGame: gameId, ["votes." + me.id]: gameId });
    };

    const votes = Object.entries(room.state.votes || {}).map(([playerId, gameId]) => ({
        gameId,
        playerId,
        color: findBy(room.clients, "id", playerId)?.color,
    }));

    const selected = getMaxVoted(votes.map((vote) => vote.gameId));

    return (
        <Stack>
            <RoomContext.Provider value={{ ...room, history, votes, selected }}>
                <BackButton />
                <Box>Room {room.name}</Box>
                <Box>{room.clients.length} players</Box>
                <Box>
                    <pre>{JSON.stringify(room.state, null, 4)}</pre>
                </Box>
                <GameList onClick={selectGame} selected={room.state?.selectedGame} />
            </RoomContext.Provider>
        </Stack>
    );
};

export interface Vote {
    gameId: Game["id"];
    playerId: Player["id"];
    color?: string;
}
export type Votes = Vote[];

export const RoomSelection = () => {
    const roomName = useAtomValue(roomNameAtom);

    return roomName ? (
        <Room />
    ) : (
        <Stack direction="row">
            <CreateGameForm />
            <JoinGameForm />
        </Stack>
    );
};
