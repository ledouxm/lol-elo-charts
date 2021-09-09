import { AppHome } from "@/components/AppHome";
import { Center, ChakraProvider, extendTheme, Flex, Spinner, Stack } from "@chakra-ui/react";
import { removeUndefineds } from "@pastable/core";
import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Link, Route, Switch, useHistory } from "react-router-dom";
import { api } from "./api";
import { AppDevTools } from "./components/AppDevTools";
import { LoginForm } from "./components/LoginForm";
import { WsEvent } from "./socket/ws";
import { getLocalPresence, usePresenceInit, usePresenceIsSynced } from "./socket/usePresence";
import { useSocketConnection, useSocketEmit, useSocketEvent } from "./socket/useSocketConnection";
import { AppMonitor } from "./monitor/AppMonitor";
import { getAccessToken } from "@/api";
import { useEffect } from "react";
import "./App.css";

const queryClient = new QueryClient();
const theme = extendTheme({ config: { initialColorMode: "light" } });

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ChakraProvider theme={theme}>
                <Flex direction="column" boxSize="100%">
                    <BrowserRouter>
                        <Switch>
                            <Route
                                path="/app"
                                children={
                                    <SyncWrapper>
                                        <Switch>
                                            <Route path="/app/monitor" children={<AppMonitor />} />
                                            <Route path="/app/" children={<AppHome />} />
                                        </Switch>
                                    </SyncWrapper>
                                }
                            />
                            <Route
                                path="/"
                                children={
                                    <Center h="100%">
                                        <LoginForm />
                                    </Center>
                                }
                            />
                        </Switch>
                        <AppDevTools />
                    </BrowserRouter>
                </Flex>
            </ChakraProvider>
        </QueryClientProvider>
    );
}

const SyncWrapper = ({ children }) => {
    const emit = useSocketEmit();
    useSocketEvent(WsEvent.Open, () => {
        // emit("sub#presence");
        emit("sub#rooms");
        // emit("sub#games");
    });

    const params = useMemo(() => removeUndefineds({ ...getLocalPresence(), token: getAccessToken() }), []);
    useSocketConnection(params);
    usePresenceInit();

    const history = useHistory();
    useEffect(() => {
        const token = getAccessToken();
        if (token) {
            api.defaults.headers.authorization = token;
        } else {
            history.replace("/");
        }
    }, []);

    const isSynced = usePresenceIsSynced();
    if (!isSynced) {
        return (
            <Center h="100%">
                <Stack>
                    <Link to="/">Go back</Link>
                    <Spinner size="xl" />
                </Stack>
            </Center>
        );
    }

    return children;
};
