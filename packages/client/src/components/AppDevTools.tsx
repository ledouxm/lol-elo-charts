import { IconAction } from "@/components/IconAction";
import { Stack, StackProps } from "@chakra-ui/react";
import { FiMonitor } from "react-icons/fi";
import { IoGameControllerOutline } from "react-icons/io5";
import { Route, Switch, useHistory } from "react-router-dom";

export const AppDevTools = (props: StackProps) => {
    const history = useHistory();
    return (
        <Stack position="fixed" bottom="30" right="30" {...props}>
            <Switch>
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
            </Switch>
        </Stack>
    );
};
