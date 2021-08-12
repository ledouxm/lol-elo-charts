import { ChakraProvider, extendTheme, Flex } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Demo } from "@/components/Demo";
import { useProviderInit, useYAwarenessInit } from "@/functions/store";
import "./App.css";

const queryClient = new QueryClient();

const theme = extendTheme({ config: { initialColorMode: "light" } });

function App() {
    useProviderInit();
    useYAwarenessInit();

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
