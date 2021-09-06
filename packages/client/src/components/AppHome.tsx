import { useSocketEvent } from "@/hooks/useSocketConnection";
import { CreateOrJoinGameForm } from "@/room/CreateOrJoinGameForm";
import { Room } from "@/types";
import { Stack } from "@chakra-ui/react";
import { Route, useHistory } from "react-router-dom";
import { LobbyRoom } from "../room/LobbyRoom";
import { PresenceList } from "./PlayerList";

export const AppHome = () => {
    const history = useHistory();

    useSocketEvent<Array<Pick<Room, "name" | "type">>>("presence/reconnect", (list) => {
        const lobby = list.find((room) => room.type === "simple");
        if (lobby) history.push("/app/lobby/" + lobby.name);
    });

    return (
        <Stack w="100%" overflow="auto">
            <PresenceList />
            <CreateOrJoinGameForm />
            <Route path={"/app/lobby/:name"} children={<LobbyRoom />} />
        </Stack>
    );
};
