import { makeArrayOf, pickOne } from "@pastable/core";
import { Triplet, useBox } from "@react-three/cannon";
import { Vector3 } from "three";

const nb = 6;
const distance = 25;
const y = 10;

const getPosition = (angle: number, distance: number) => [Math.cos(angle) * distance, y, Math.sin(angle) * distance];
const getStagesPositions = () => {
    return makeArrayOf(nb * 2).map((_, index) => [
        ...getPosition((Math.PI / nb) * index, distance),
        (Math.PI / nb) * index,
    ]);
};
const stagePositions = getStagesPositions();

export const getRandomStagePosition = () => {
    const pos = pickOne(stagePositions);
    return [pos[0], y + 10, pos[2]];
};

export const Stage = ({ position }: { position: Triplet }) => {
    return (
        <group position={position}>
            {stagePositions.map((pos, index) => (
                <StageBox key={index} position={[pos[0], pos[1], pos[2]]} angle={pos[3]} />
            ))}
        </group>
    );
};

const StageBox = ({ position, angle }: { position: Triplet; angle: number }) => {
    const rotation = new Vector3(0, -angle + Math.PI / 2, 0);

    const scale = new Vector3(6.5, 1, 10);
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
