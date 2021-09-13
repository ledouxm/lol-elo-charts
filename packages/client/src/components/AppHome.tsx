import { Stack } from "@chakra-ui/react";
import { Route, Switch, useHistory } from "react-router-dom";

import { CreateOrJoinLobbyForm } from "@/room/CreateOrJoinLobbyForm";
import { useSocketEvent } from "@/socket/useSocketConnection";
import { Room } from "@/types";

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
            <Switch>
                <Route path={"/app/lobby/:name"} children={<LobbyRoom />} />
                <Route path={"/app/"} children={<CreateOrJoinLobbyForm />} />
            </Switch>
        </Stack>
    );
};
