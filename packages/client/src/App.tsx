import "./App.css";

import { Center, ChakraProvider, Flex, Icon, Spinner, Stack, chakra, extendTheme } from "@chakra-ui/react";
import { removeUndefineds } from "@pastable/core";
import { useMemo } from "react";
import { useEffect } from "react";
import { IoSyncOutline } from "react-icons/io5";
import { RiWifiOffLine } from "react-icons/ri";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Link, Route, Switch, useHistory } from "react-router-dom";

import { getAccessToken } from "@/api";
import { AppHome } from "@/components/AppHome";

import { api } from "./api";
import { AppDevTools } from "./components/AppDevTools";
import { LoginForm } from "./components/LoginForm";
import { AppMonitor } from "./monitor/AppMonitor";
import { getLocalPresence, usePresenceInit, usePresenceIsSynced } from "./socket/usePresence";
import { useSocketConnection, useSocketEmit, useSocketEvent, useSocketStatus } from "./socket/useSocketConnection";
import { WsEvent } from "./socket/ws";

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
    const state = useSocketConnection(params);
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

    const status = useSocketStatus();
    const isSynced = usePresenceIsSynced();
    if (status === "closed" || status === "loading") {
        return (
            <Center h="100%">
                <Stack alignItems="center">
                    <Stack direction="row" alignItems="center">
                        <Icon as={RiWifiOffLine} />
                        <chakra.span>Offline</chakra.span>
                    </Stack>
                    {status === "closed" ? (
                        <chakra.span>Connection closed. Will retry in a few seconds.</chakra.span>
                    ) : (
                        Boolean(state.context.retries || state.context.loop) && (
                            <>
                                <chakra.span>
                                    Retrying... ({state.context.retries + state.context.loop * 10})
                                </chakra.span>
                                <Spinner size="xl" />
                            </>
                        )
                    )}
                    <Link to="/">Go back to home</Link>
                </Stack>
            </Center>
        );
    }

    if (!isSynced) {
        return (
            <Center h="100%">
                <Stack alignItems="center">
                    <Stack direction="row" alignItems="center">
                        <Icon as={IoSyncOutline} />
                        <chakra.span>Presence de-synchronized...</chakra.span>
                    </Stack>
                    <Spinner size="xl" />
                    <Link to="/">Go back to home</Link>
                </Stack>
            </Center>
        );
    }

    return children;
};
