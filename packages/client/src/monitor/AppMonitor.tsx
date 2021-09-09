import { IconAction } from "@/components/IconAction";
import { Stack, StackProps } from "@chakra-ui/react";
import { FiMonitor } from "react-icons/fi";
import { IoGameControllerOutline } from "react-icons/io5";
import { Route, Switch, useHistory } from "react-router-dom";
import { getRoles } from "@/socket/usePresence";
import { RoomMonitor } from "./RoomMonitor";
import { useEffect } from "react";

export const AppMonitor = () => {
    const history = useHistory();

    useEffect(() => {
        const roles = getRoles();
        if (!roles.includes("admin")) {
            history.replace("/app");
        }
    }, []);

    // vertical accordion-like (not chakraui tho since it uses btns and cant be nested)
    // for: [presence, rooms, games]

    // presence shows the list of all connected clients in a table
    // columns = [name, clientId, userId]
    // action column ->
    // - send -> event+payload
    // - roles -> modal to see the list of current roles + add/remove some
    // - inspect -> opens a details page/box where we can see client state/meta rooms/games

    // rooms/games shows the list of all created rooms in a table
    // columns = [name, creator, clients ids, clients length, actions]
    // action column ->
    // - send -> room.broadcast event+payload
    // - remove -> remove current room
    // - inspect -> opens a details page/box where we can see :
    // ---- room.state/meta
    // ---- edit form with custom state depending on type (lobby = LobbyState) with json editor or even more specific ?
    // ---- each client state/meta & same actions as presence table + "set room role" = prefilled role for this room

    // TODO filter rooms by type (lobby) / games by game type (platformer/tictactoe)
    // TODO get the list of game types from api

    return (
        <Stack w="100%" overflow="auto">
            {/* <Switch>
                <Route
                    path="/app/monitor"
                    exact
                    children={
                        <IconAction icon={IoGameControllerOutline} label="App" onClick={() => history.push("/app")} />
                    }
                />
                <Route
                    path="/app"
                    children={
                        <IconAction icon={FiMonitor} label="Monitor" onClick={() => history.push("/app/monitor")} />
                    }
                />
            </Switch> */}
            <RoomMonitor />
        </Stack>
    );
};
