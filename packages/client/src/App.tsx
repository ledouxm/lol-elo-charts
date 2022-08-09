import "./App.css";

import { ChakraProvider, extendTheme, Flex } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();
const theme = extendTheme({ config: { initialColorMode: "light" } });

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ChakraProvider theme={theme}>
                <Flex direction="column" boxSize="100%">
                    {/* <BrowserRouter>
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
                    </BrowserRouter> */}
                </Flex>
            </ChakraProvider>
        </QueryClientProvider>
    );
}
