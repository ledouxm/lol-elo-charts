import { Box, BoxProps } from "@chakra-ui/react";
import { Physics, Triplet } from "@react-three/cannon";
import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import { AppLight } from "../components/AppLight";
import { SkyDome } from "../components/SkyDome";
import { useInputsRef } from "../hooks/useInputsRef";
import { Character } from "./character/Character";
import { HexagonGrid } from "./Hexagon";
import { Players } from "./Player";
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
