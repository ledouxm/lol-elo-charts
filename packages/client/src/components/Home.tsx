import { useSocketEvent } from "@/hooks/useSocketConnection";
import { CreateOrJoinGameForm } from "@/room/CreateOrJoinGameForm";
import { Room } from "@/types";
import { Stack } from "@chakra-ui/react";
import { Route, useHistory } from "react-router-dom";
import { LobbyRoom } from "../room/LobbyRoom";
import { AppDevTools } from "./AppDevTools";
import { PlayerList } from "./PlayerList";

export const Home = () => {
    const history = useHistory();

    useSocketEvent<Array<Pick<Room, "name" | "type">>>("presence/reconnect", (list) => {
        const lobby = list.find((room) => room.type === "simple");
        if (lobby) history.push("/lobby/" + lobby.name);
    });

    return (
        <Stack w="100%" overflow="hidden">
            <PlayerList />
            <Route path="/lobby/:name" children={<LobbyRoom />} />
            <Route path="/" children={<CreateOrJoinGameForm />} />
            <AppDevTools />
        </Stack>
    );
};
