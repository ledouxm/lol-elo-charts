import "../styled-system/styles.css";
import "./App.css";
import valorantProps from "./valorantMock.json";
import props from "./mock.json";
import { MatchDetails, MatchDamage, MatchRandomInformations } from "./components";
import { ValorantMatchDetails } from "./components";
import { DefaultProps, DefaultValorantProps } from "./components/utils";

export function App() {
    return (
        <>
            <ValorantMatchDetails {...(valorantProps as DefaultValorantProps)} />

            <MatchDetails {...(props as DefaultProps)} />
            <MatchRandomInformations {...(props as DefaultProps)} />
            <MatchDamage {...(props as DefaultProps)} />
        </>
    );
}

export default App;
