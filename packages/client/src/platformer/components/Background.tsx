import { usePlane } from "@react-three/cannon";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

import textureImg from "/assets/texture.jpg";

export const Ground = () => {
    const texture = useLoader(THREE.TextureLoader, textureImg);
    const [ref] = usePlane(() => ({
        type: "Static",
        position: [0, -10, 0],
        rotation: [-Math.PI / 2, 0, 0],
    }));

    return (
        <mesh ref={ref} receiveShadow scale={50}>
            <planeBufferGeometry />
            <meshStandardMaterial attach="material" map={texture} />
        </mesh>
    );
};

export const Pit = ({ y }: { y: number }) => {
    const texture = useLoader(THREE.TextureLoader, textureImg);
    const [ref] = usePlane(() => ({
        type: "Static",
        position: [0, y, 0],
        isTrigger: true,
        rotation: [-Math.PI / 2, 0, 0],
    }));

    return (
        <mesh ref={ref} visible={false} name="pit" scale={150}>
            <planeBufferGeometry />
            <meshStandardMaterial attach="material" map={texture} />
        </mesh>
    );
};
