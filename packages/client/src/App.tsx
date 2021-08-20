import { Home } from "@/components/Home";
import { WebDemo } from "@/components/WebDemo";
import { Center, ChakraProvider, extendTheme, Flex, Spinner } from "@chakra-ui/react";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { api, getAccessToken } from "./api";
import "./App.css";
import { LoginForm } from "./components/LoginForm";
import { WsEvent } from "./functions/ws";
import { getLocalPresence, usePresenceInit, usePresenceIsSynced } from "./hooks/usePresence";
import { useSocketConnection, useSocketEmit, useSocketEvent } from "./hooks/useSocketConnection";

const queryClient = new QueryClient();

const theme = extendTheme({ config: { initialColorMode: "light" } });

function App() {
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
                                            <Route path="/app/web" exact children={<WebDemo />} />
                                            <Route path="/app/" children={<Home />} />
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
                    </BrowserRouter>
                </Flex>
            </ChakraProvider>
        </QueryClientProvider>
    );
}

const SyncWrapper = ({ children }) => {
    const emit = useSocketEmit();
    useSocketEvent(WsEvent.Open, () => {
        emit("sub#presence");
        emit("sub#rooms");
        emit("sub#games");
    });

    useSocketConnection(getLocalPresence());
    usePresenceInit();

    useEffect(() => {
        const token = getAccessToken();
        if (!token) {
            api.defaults.headers.authorization = token;
        }
    }, []);

    const isSynced = usePresenceIsSynced();
    if (!isSynced) {
        return (
            <Center h="100%">
                <Spinner size="xl" />
            </Center>
        );
    }

    return children;
};

export default App;
