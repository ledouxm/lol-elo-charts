import { Box, BoxProps } from "@chakra-ui/react";
import { makeArrayOf } from "@pastable/core";
import { Physics, Triplet } from "@react-three/cannon";
import { Canvas } from "@react-three/fiber";
import { Fragment, Suspense, useEffect } from "react";
import { useRef } from "react";
import { AppLight } from "../components/AppLight";
import { Pit } from "../components/Background";
import { Character } from "./character/Character";
import { HexagonGrid, nbHexagons, startNewGame } from "./Hexagon";
import { useInputsRef } from "../hooks/useInputsRef";
import { SkyDome } from "../components/SkyDome";
import { Stars } from "@react-three/drei";
import { Players } from "./Player";
import { hexagonsYMap, provider } from "@/functions/store";
import { Stage } from "./Stage";

const requestPointerLock = () => {
    const canvas = document.body;
    //@ts-ignore
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;

    canvas.requestPointerLock();
};

const characterPosition = [25, 30, 0];
export const nbFloors = 5;
const colors = ["#003049", "#d62828", "#f77f00", "#fcbf49", "#eae2b7"];

export const PlatformerCanvas = (props: BoxProps) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        requestPointerLock();

        document.body.onclick = () => requestPointerLock();
    }, []);

    useEffect(() => {
        const me = provider.awareness.getLocalState();
        if (!me.isAdmin) return;

        if (nbHexagons === hexagonsYMap.size) return;
        startNewGame();
    }, []);

    useInputsRef();

    return (
        <Box {...props}>
            <Canvas
                shadows
                style={{
                    height: "100%",
                    width: "100%",
                }}
                camera={{
                    far: 2000,
                    position: [characterPosition[0] + 10, characterPosition[1], characterPosition[2]],
                }}
                ref={canvasRef}
            >
                <ambientLight intensity={0.2} />
                <AppLight />
                <Players />
                <Suspense fallback={null}>
                    <SkyDome />
                </Suspense>

                <Physics
                    defaultContactMaterial={{
                        restitution: 0,
                        friction: 0,
                    }}
                    gravity={[0, -4 * 9.8, 0]}
                    step={1 / 144}
                    broadphase="Naive"
                >
                    <Stage position={[0, 0, 0]} />
                    <Pit y={nbFloors * -10 - 10} />
                    <Stars count={1000} radius={70} />
                    {makeArrayOf(nbFloors).map((_, index) => (
                        <Fragment key={index}>
                            <AppLight position={[-40, index * -10 + 7, 0]} />
                            <HexagonGrid y={index * -10} color={colors[index]} floorIndex={index} />
                        </Fragment>
                    ))}
                    <Character position={characterPosition as Triplet} />
                </Physics>
            </Canvas>
        </Box>
    );
};

export const shouldGatherRef = {
    current: false,
};
