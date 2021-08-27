import { useSocketEvent } from "@/hooks/useSocketConnection";
import { CreateOrJoinGameForm } from "@/room/CreateOrJoinGameForm";
import { Room } from "@/types";
import { Stack } from "@chakra-ui/react";
import { Route, Switch, useHistory } from "react-router-dom";
import { LobbyRoom } from "../room/LobbyRoom";
import { AppDevTools } from "./AppDevTools";
import { PlayerList } from "./PlayerList";

export const AppHome = () => {
    const history = useHistory();

    useSocketEvent<Array<Pick<Room, "name" | "type">>>("presence/reconnect", (list) => {
        const lobby = list.find((room) => room.type === "simple");
        if (lobby) history.push("/app/lobby/" + lobby.name);
    });

    return (
        <Stack w="100%" overflow="auto">
            <PlayerList />
            <Switch>
                <Route path={"/app/lobby/:name"} children={<LobbyRoom />} />
                <Route path={"/app/"} children={<CreateOrJoinGameForm />} />
            </Switch>
        </Stack>
    );
};
