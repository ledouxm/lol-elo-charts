import "../styled-system/styles.css";
import "./App.css";
import props from "./mock.json";
import { MatchDamage } from "./components/MatchDamage";
import { DefaultProps } from "./components/utils";

export function App() {
    return (
        <>
            <MatchDamage {...(props as any as DefaultProps)} />
        </>
    );
}

export default App;
