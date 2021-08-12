import { ChakraProvider, extendTheme, Flex } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Demo } from "@/components/Demo";
import { provider, useProviderInit, useYAwarenessInit } from "@/functions/store";
import "./App.css";
import { useEffect } from "react";
import { getOtherPlayers, getPlayers } from "./platformer/features/Player";

const queryClient = new QueryClient();

const theme = extendTheme({ config: { initialColorMode: "light" } });

function App() {
    useProviderInit();
    useYAwarenessInit();

    useEffect(() => {
        provider.on("update", ({ removed }) => {
            if (removed.length > 0) return;

            const { me, otherPlayers } = getOtherPlayers();
            if (otherPlayers.some((player) => player.isAdmin)) return;

            const futureUserIndex = Math.min(...otherPlayers.map((player) => player.index));
            if (me.index !== futureUserIndex) return;

            provider.awareness.setLocalState({ ...me, isAdmin: true });
        });
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <ChakraProvider theme={theme}>
                <Flex direction="column" boxSize="100%">
                    <Demo />
                </Flex>
            </ChakraProvider>
        </QueryClientProvider>
    );
}

export default App;
