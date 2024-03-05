import "../styled-system/styles.css";
import "./App.css";
import props from "./mock.json";
import * as components from "./components";
import { DefaultProps } from "./components/utils";

export function App() {
    return (
        <>
            {Object.values(components).map((Component, index) => (
                <Component key={index} {...(props as any as DefaultProps)} />
            ))}
        </>
    );
}

export default App;
