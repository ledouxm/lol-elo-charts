import { useGameRoomState } from "@/hooks/useGameRoomState";
import { useMyPresence } from "@/hooks/usePresence";
import { Player } from "@/types";
import { Triplet } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useContext, useRef } from "react";
import { Mesh, Vector3 } from "three";
import { sliceColor } from "./character/Character";
import { PlatformerContext } from "./PlatformerCanvas";

export const Players = () => {
    const { gameName } = useContext(PlatformerContext);
    const { state, clients } = useGameRoomState<{ [id: string]: Triplet[] }>(gameName);

    const me = useMyPresence();
    return (
        <>
            {(clients || [])
                .map((client) => ({ ...client, state: Object.entries(state).find(([id]) => id === client.id)?.[1] }))
                .filter((client) => !!client.state && client.id !== me.id)
                .map((client) => (
                    <Cube
                        key={client.id}
                        color={sliceColor(client.color)}
                        position={client.state[0]}
                        rotation={client.state[1]}
                    />
                ))}
        </>
    );
};

export const Cube = ({
    position,
    rotation,
    color,
}: {
    color: Player["color"];
    position: Triplet;
    rotation: Triplet;
}) => {
    const meshRef = useRef<Mesh>(null);

    useFrame(() => {
        meshRef.current.position.lerp(new Vector3(...position), 0.1);
    });

    return (
        <mesh ref={meshRef} rotation={rotation}>
            <boxGeometry />
            <meshStandardMaterial color={color} />
        </mesh>
    );
};
