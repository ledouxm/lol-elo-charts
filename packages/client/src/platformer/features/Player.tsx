import { Payload, playersAtom } from "@/components/AppSocket";
import { useFrame } from "@react-three/fiber";
import { useAtomValue } from "jotai/utils";
import { useRef } from "react";
import { Mesh, Vector3 } from "three";

export const Players = () => {
    const players = useAtomValue(playersAtom);
    return (
        <>
            {players.filter(Boolean).map((player) => (
                <Cube key={player.id} {...player} />
            ))}
        </>
    );
};

export const Cube = ({ position, rotation, color }: Payload) => {
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
