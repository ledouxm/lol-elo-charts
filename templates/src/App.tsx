import "../styled-system/styles.css";
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { css } from "../styled-system/css";
import props from "./mock.json";
import { MatchDamage } from "./components/MatchDamage";
import { DefaultProps } from "./components/utils";

export function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <MatchDamage {...(props as any as DefaultProps)} />
        </>
    );
}

export default App;
