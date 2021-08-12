import { BackSide } from "three";

export const SkyDome = () => {
    // const texture = useLoader(TextureLoader, textureImg);

    return (
        <mesh>
            <sphereBufferGeometry attach="geometry" args={[200, 60, 40]} />
            <meshBasicMaterial attach="material" color={"black"} side={BackSide} />
        </mesh>
    );
};
