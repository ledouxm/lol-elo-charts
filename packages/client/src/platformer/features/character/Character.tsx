import { getRandomColor } from "@/functions/utils";
import { useLocalPresence } from "@/socket/usePresence";
import { useSocketEmit } from "@/socket/useSocketConnection";
import { roundTo } from "@pastable/core";
import { Triplet, useBox } from "@react-three/cannon";
import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useRef } from "react";
import * as THREE from "three";
import { keyDownRef, keyPressedRef } from "../../hooks/useInputsRef";
import { useMouseMovements } from "../../hooks/useMouseMovement";
import { startNewGame } from "../Hexagon";
import { PlatformerContext } from "../PlatformerCanvas";
import { getRandomStagePosition } from "../Stage";
import { calculateForce } from "./utils";

const speed = 5;
const jumpForce = 25;
const cameraSensitivity = 5;

const tripletToFixed = (tri: Triplet) => tri.map((nb) => roundTo(nb, 4));

export const Character = ({ position, baseAngle }: { position: Triplet; baseAngle: number }) => {
    const [me, updateMe] = useLocalPresence();
    const emit = useSocketEmit();

    const updateColor = () => {
        const color = getRandomColor();
        updateMe((me) => ({ ...me, color }));
    };

    const { gameName } = useContext(PlatformerContext);
    const updatePositionAndRotation = (position: Triplet, rotation: Triplet) => {
        emit(`games.update#${gameName}`, { [me.id]: [tripletToFixed(position), tripletToFixed(rotation)] });
    };
    const { camera } = useThree();

    useEffect(() => {
        const interval = setInterval(() => {
            if (!positionRef.current) return;
            updatePositionAndRotation(positionRef.current, rotationRef.current);
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const [meshRef, api] = useBox(() => ({
        mass: 10,
        angularFactor: [0, 0, 0],
        linearDamping: 0.99,
        linearFactor: [0.1, 1, 0.1],
        rotation: [0, -baseAngle, 0],
        onCollideBegin: (e) => {
            switch (e.body.name) {
                case "pit":
                    const randomStage = getRandomStagePosition();

                    api.position.set(...(randomStage.slice(0, -1) as Triplet));
                    rotationRef.current = [0, -randomStage[3], 0];
            }
            groundedRef.current = true;
        },
        material: {
            restitution: 0,
        },
        position,
    }));

    // Track mouse movements
    const mouseMovementRef = useMouseMovements();

    // Mesh data
    const positionRef = useRef<Triplet>(position);
    const rotationRef = useRef<Triplet>([0, -baseAngle, 0]);
    const velocityRef = useRef<Triplet>([0, 0, 0]);
    const groundedRef = useRef(false);

    // Game data
    const isPausedRef = useRef(false);
    // const isSyncedRef = useRef(false);

    useEffect(() => {
        // Store CannonJS data into refs so we can use them in useFrame
        api.position.subscribe((p) => (positionRef.current = p));
        api.rotation.subscribe((r) => (rotationRef.current = r));
        api.velocity.subscribe((r) => (velocityRef.current = r));
    }, []);

    useFrame(({ clock }) => {
        const deltaTime = clock.getDelta();

        const currentRotation = rotationRef.current;

        // KEYBOARD INPUT HANDLERS

        // Go forward
        if (keyDownRef.currents.has("KeyW")) {
            const force = calculateForce(rotationRef.current[1], speed, [-1, 0, 0]);

            velocityRef.current[0] = force.x;
            velocityRef.current[2] = force.z;
        }

        // Go backward
        if (keyDownRef.currents.has("KeyS")) {
            const force = calculateForce(rotationRef.current[1], speed, [0.8, 0, 0]);

            velocityRef.current[0] = force.x;
            velocityRef.current[2] = force.z;
        }

        // Rotate left
        if (keyDownRef.currents.has("KeyA")) {
            currentRotation[1] += 0.02;
        }

        // Rotate right
        if (keyDownRef.currents.has("KeyD")) {
            currentRotation[1] -= 0.02;
        }

        // Jump
        if (keyDownRef.currents.has("Space")) {
            if (groundedRef.current && Math.abs(velocityRef.current[1]) < 0.1) {
                groundedRef.current = false;
                velocityRef.current[1] = jumpForce;
            }
        }

        // Pause
        if (keyPressedRef.currents.has("KeyP")) {
            isPausedRef.current = !isPausedRef.current;

            if (isPausedRef.current) {
                api.mass.set(0);
            } else {
                api.mass.set(10);
            }
        }

        if (keyPressedRef.currents.has("KeyR")) {
            updateColor();
        }

        if (keyPressedRef.currents.has("KeyM")) {
            startNewGame();
        }

        keyPressedRef.currents.clear();

        // Apply rotation
        if (mouseMovementRef.current)
            currentRotation[1] -= mouseMovementRef.current[0] * 0.01 * deltaTime * cameraSensitivity;

        mouseMovementRef.current = [0, 0];

        // Update mesh velocity and rotation
        api.velocity.set(...velocityRef.current);
        api.rotation.set(...currentRotation);

        // Calculate ideal camera position
        const currentPos = new THREE.Vector3(...positionRef.current);

        const relativeCameraOffset = new THREE.Vector3(10, 3, 0);
        const cameraOffset = relativeCameraOffset.applyMatrix4(meshRef.current.matrixWorld);
        // Update camera position and rotation
        camera.position.lerp(cameraOffset, 0.1);
        camera.lookAt(currentPos);
    });

    return (
        <>
            <mesh ref={meshRef} name="character" castShadow>
                <boxGeometry />
                <meshStandardMaterial color={(me && sliceColor(me.color)) || "white"} />
            </mesh>
        </>
    );
};

export const sliceColor = (color: string) => (!color ? "black" : color.length > 7 ? color.slice(0, -2) : color);
