import { provider } from "@/functions/store";
import { Triplet } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useState } from "react";
import { Mesh, MeshStandardMaterial, Vector3 } from "three";

export const getPlayers = () => {
    const playersMap = provider.awareness.getStates();
    return Array.from(playersMap.values());
};

export const getOtherPlayers = () => {
    const myAwareness = provider.awareness.getLocalState();

    return { me: myAwareness, otherPlayers: getPlayers().filter((player) => player.id !== myAwareness.id) };
};

export const Players = () => {
    const [players, setPlayers] = useState<number[]>(getOtherPlayers().otherPlayers.map((player) => player.id));

    provider.awareness.on("update", ({ added }) => {
        if (added.length) {
            setPlayers(getOtherPlayers().otherPlayers.map((player) => player.id));
        }
    });

    return (
        <>
            {players.filter(Boolean).map((player) => (
                <Cube id={player} key={player} />
            ))}
        </>
    );
};

export const Cube = ({ id }: { id: number }) => {
    const meshRef = useRef<Mesh>(null);
    const matRef = useRef<MeshStandardMaterial>(null);

    const positionRef = useRef<Triplet>([0, 0, 0]);
    const rotationRef = useRef<Triplet>([0, 0, 0]);

    useFrame(() => {
        if (!id) return;
        const myAwareness = provider.awareness.getLocalState();
        const playersMap = provider.awareness.getStates();

        const playersArr = Array.from(playersMap.values()).filter((player) => player.id !== myAwareness.id);

        const me = playersArr.find((player) => player.id === id);

        if (!me) return;

        if (!me.position || !me.rotation) return;

        positionRef.current = me.position;
        rotationRef.current = me.rotation;

        meshRef.current.rotation.set(...rotationRef.current);
        meshRef.current.position.lerp(new Vector3(...positionRef.current), 0.1);

        matRef.current.color.set(me.color.slice(0, -2));
    });

    return (
        <mesh ref={meshRef}>
            <boxGeometry />
            <meshStandardMaterial ref={matRef} />
        </mesh>
    );
};
