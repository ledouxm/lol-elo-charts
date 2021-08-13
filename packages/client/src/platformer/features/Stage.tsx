import { makeArrayOf } from "@pastable/core";
import { Triplet, useBox } from "@react-three/cannon";
import { Vector3 } from "three";

const getPosition = (angle: number, distance: number) => [Math.cos(angle) * distance, Math.sin(angle) * distance];

const nb = 16;
const getStagesPositions = () => {
    return makeArrayOf(nb * 2).map((_, index) => [...getPosition((Math.PI / nb) * index, 25), (Math.PI / nb) * index]);
};

export const Stage = ({ position }: { position: Triplet }) => {
    const y = 10;
    const positions = getStagesPositions();

    return (
        <group position={position}>
            {positions.map((pos, index) => (
                <StageBox key={index} position={[pos[0], y, pos[1]]} angle={pos[2]} />
            ))}
        </group>
    );
};

const StageBox = ({ position, angle }: { position: Triplet; angle: number }) => {
    const rotation = new Vector3(0, -angle + Math.PI / 2, 0);

    const scale = new Vector3(5.89, 1, 10);
    const [ref] = useBox(() => ({
        type: "Static",
        position,
        args: scale.toArray(),
        rotation: rotation.toArray(),
    }));

    return (
        <mesh ref={ref} scale={scale}>
            <boxGeometry />
            <meshStandardMaterial color="#8d99ae" />
        </mesh>
    );
};
