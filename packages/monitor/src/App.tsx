import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";
import { MonitorPage } from "./Monitor";

function App() {
    return (
        <>
            <ChakraProvider>
                <MonitorPage />
            </ChakraProvider>
        </>
    );
}

export default App;
