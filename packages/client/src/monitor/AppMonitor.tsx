import { Heading, Stack, chakra } from "@chakra-ui/react";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";

import { getRoles } from "@/socket/usePresence";

import { PresenceMonitor } from "./PresenceMonitor";
import { RoomMonitor } from "./RoomMonitor";

export const AppMonitor = () => {
    const history = useHistory();

    // Redirect to /app if not admin
    useEffect(() => {
        const roles = getRoles();
        if (!roles.includes("global.admin")) {
            history.replace("/app");
        }
    }, []);

    // vertical accordion-like (not chakraui tho since it uses btns and cant be nested)
    // for: [presence, rooms, games]

    // TODO filter rooms by type (lobby) / games by game type (platformer/tictactoe)
    // TODO get the list of game types from api

    return (
        <Stack w="70%" overflow="auto" m="auto">
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
            <Heading as="h2" size="lg">
                Room monitor
            </Heading>
            <RoomMonitor />
            <chakra.div>
                <Heading as="h2" size="lg" my="4">
                    Presence monitor
                </Heading>
                <PresenceMonitor />
            </chakra.div>
        </Stack>
    );
};
