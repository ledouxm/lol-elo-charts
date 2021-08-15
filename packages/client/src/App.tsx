import { Demo } from "@/components/Demo";
import { WebDemo } from "@/components/WebDemo";
import { Center, ChakraProvider, extendTheme, Flex, Spinner } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";
import "./App.css";
import { AppSocket } from "./components/AppSocket";
import { WsEvent } from "./functions/ws";
import { initialPresence, usePresenceInit, usePresenceIsSynced } from "./hooks/usePresence";
import { useSocketConnection, useSocketEmit, useSocketEvent } from "./hooks/useSocketConnection";
import { Route, BrowserRouter, Switch } from "react-router-dom";

const queryClient = new QueryClient();

const theme = extendTheme({ config: { initialColorMode: "light" } });

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ChakraProvider theme={theme}>
                <Flex direction="column" boxSize="100%">
                    <SyncWrapper />
                </Flex>
            </ChakraProvider>
        </QueryClientProvider>
    );
}

const SyncWrapper = () => {
    const emit = useSocketEmit();
    useSocketEvent(WsEvent.Open, () => {
        emit("sub#presence");
        emit("sub#rooms");
        emit("sub#games");
    });

    useSocketConnection(initialPresence);
    usePresenceInit();

    const isSynced = usePresenceIsSynced();
    if (!isSynced) {
        return (
            <Center h="100%">
                <Spinner size="xl" />
            </Center>
        );
    }

    return (
        <>
            <AppSocket />
            <BrowserRouter>
                <Switch>
                    <Route path="/web" children={<WebDemo />} />
                    <Route path="/" children={<Demo />} />
                </Switch>
            </BrowserRouter>
        </>
    );
};
export default App;
