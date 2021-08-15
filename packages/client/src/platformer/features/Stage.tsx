import { makeArrayOf, pickOne } from "@pastable/core";
import { Triplet, useBox } from "@react-three/cannon";
import { Color, DataTexture, MeshStandardMaterial, RGBFormat, Vector3 } from "three";

const nb = 6;
const distance = 25;
const y = 10;

const getPosition = (angle: number, distance: number) => [Math.cos(angle) * distance, y, Math.sin(angle) * distance];
const getStagesPositions = () => {
    return makeArrayOf(nb * 2).map((_, index) => {
        const newAngle = (((Math.PI * index) / nb) % (Math.PI * 2)) - Math.PI;

        return [...getPosition(newAngle, distance), newAngle];
    });
};
const stagePositions = getStagesPositions();

export const getRandomStagePosition = () => {
    const pos = pickOne(stagePositions);
    return [pos[0], y + 10, pos[2], pos[3]] as [x: number, y: number, z: number, angle: number];
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

export const createMonocromaticTexture = (color: Color) => {
    const size = 1;
    const data = new Uint8Array(3 * size);

    data[0] = Math.floor(color.r * 255);
    data[1] = Math.floor(color.g * 255);
    data[2] = Math.floor(color.b * 255);

    const texture = new DataTexture(data, 1, 1, RGBFormat);
    texture.needsUpdate = true;

    return texture;
};

const StageBox = ({ position, angle }: { position: Triplet; angle: number }) => {
    const texture1 = createMonocromaticTexture(new Color("#161a1d"));
    const texture2 = createMonocromaticTexture(new Color("#b1a7a6"));

    const mat1 = new MeshStandardMaterial({ map: texture1 });
    const mat2 = new MeshStandardMaterial({ map: texture2 });

    const materials = [mat1, mat1, mat2, mat2, mat1, mat1];

    const rotation = new Vector3(0, -angle + Math.PI / 2, 0);

    const scale = new Vector3(6.5, 1, 10);
    const [ref] = useBox(() => ({
        type: "Static",
        position,
        args: scale.toArray(),
        rotation: rotation.toArray(),
    }));
    return (
        <mesh ref={ref} material={materials} scale={scale}>
            <boxGeometry />
        </mesh>
    );
};
