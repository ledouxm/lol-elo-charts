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
import { getRandomStagePosition, Stage } from "./Stage";

const requestPointerLock = () => {
    const canvas = document.body;
    //@ts-ignore
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;

    canvas.requestPointerLock();
};

export const PlatformerCanvas = (props: BoxProps) => {
    const canvasRef = useRef(null);
    const characterPosition = getRandomStagePosition();

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
                    <Stars count={1000} radius={70} />
                    <AppLight position={[-40, 0 + 7, 0]} />
                    <HexagonGrid />
                    <Character position={characterPosition.slice(0, -1) as Triplet} baseAngle={characterPosition[3]} />
                </Physics>
            </Canvas>
        </Box>
    );
};

export const shouldGatherRef = {
    current: false,
};
