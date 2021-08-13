import { hexagonsYMap, provider, yDoc } from "@/functions/store";
import { makeArrayOf } from "@pastable/react/node_modules/@pastable/utils";
import { useCylinder } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { MeshProps } from "@react-three/fiber";
import { nanoid } from "nanoid";
import { useEffect } from "react";
import { useRef } from "react";
import { Color, MeshStandardMaterial, Vector3 } from "three";
import { nbFloors } from "./PlatformerCanvas";

const min = -0.05;
const max = 0.1;

const getSaturedColor = (hexColor: string) => {
    const color = Number("0x" + hexColor.slice(1));

    const random = Math.random() * (max - min) + min;

    return new Color(color).offsetHSL(0, 0, random);
};

const factor = 0.8660254;

const parentSize = 2.15;
const parentHeight = parentSize * 2 * factor;

const size = 2;
const characterSize = 1;

const disappearDelay = 1000;

// const hexagonsPerRow = [3, 6, 3];
const hexagonsPerRow = [3, 6, 9, 10, 11, 10, 11, 10, 9, 6, 3];
export const nbHexagons = hexagonsPerRow.reduce((acc) => acc + 1);

const zOffset = ((hexagonsPerRow.length - 1) * Math.sqrt(3) * (parentHeight / 2)) / 2;

const makeRow = (nb: number, index: number) => {
    const hexagons = makeArrayOf(nb).map((_, subIndex) => ({
        x: subIndex * parentHeight,
        id: nanoid(12),
        z: index * Math.sqrt(3) * (parentHeight / 2) - zOffset,
    }));
    const avgX =
        hexagons.reduce((acc, current) => acc + current.x, 0) / hexagons.length + parentSize / 2 + characterSize / 2;

    return hexagons.map((hexa) => ({ ...hexa, x: hexa.x - avgX }));
};

export const HexagonGrid = ({ y, color = "blue", floorIndex }: { y: number; color: string; floorIndex: number }) => {
    return (
        <>
            {hexagonsPerRow.flatMap((nb, index) =>
                makeRow(nb, index).map(({ x, z, id }, subIndex) => {
                    const newColor = Math.random() > 0.5 ? new Color(color) : getSaturedColor(color);
                    return (
                        <Hexagon
                            key={id}
                            color={newColor}
                            position={[x, y, z]}
                            id={makeHexagonId(floorIndex, index, subIndex)}
                            isCenter={
                                index === Math.floor(hexagonsPerRow.length / 2) && subIndex === Math.floor(nb / 2)
                            }
                        />
                    );
                })
            )}
        </>
    );
};

const makeHexagonId = (floorIndex: number, index: number, subIndex: number) => [floorIndex, index, subIndex].join(",");

const getHexagonStatus = (id: string) => yDoc.getMap("hexagons").get(id);

export const startNewGame = () => {
    hexagonsYMap.clear();
    for (let floorIndex = 0; floorIndex < nbFloors; floorIndex++) {
        hexagonsPerRow.forEach((nb, index) => {
            for (let subIndex = 0; subIndex < nb; subIndex++) {
                hexagonsYMap.set(makeHexagonId(floorIndex, index, subIndex), "idle");
            }
        });
    }
};

export const Hexagon = ({
    position,
    color,
    isCenter,
    id,
    ...props
}: { isCenter: boolean; color: Color | string; id: string } & Omit<MeshProps, "id">) => {
    const args = [size, size, 0.5, 6] as any;

    const prevStatusRef = useRef("");
    const materialRef = useRef<MeshStandardMaterial>(null);

    useEffect(() => {
        if (!hexagonsYMap.has(id)) hexagonsYMap.set(id, "idle");
    }, []);

    const [ref, api] = useCylinder(() => ({
        type: "Static",
        //@ts-ignore
        position: position,
        onCollide: () => {
            const status = getHexagonStatus(id);

            if (status === "idle") {
                // statusRef.current = "disappearing";
                hexagonsYMap.set(id, "disappearing");

                setTimeout(() => {
                    // statusRef.current = "destroyed";
                    hexagonsYMap.set(id, "destroyed");

                    // api.collisionResponse.set(0);
                }, disappearDelay);
            }
        },
        args,
    }));

    useFrame(() => {
        const status = getHexagonStatus(id);

        if (status !== prevStatusRef.current && status === "idle") {
            api.isTrigger.set(false);
            materialRef.current.visible = true;
            materialRef.current.color.set(color);
        }

        if (status === "disappearing") {
            const dest = new Vector3(position[0], position[1] - 0.2, position[2]);
            const lerped = ref.current.position.lerp(dest, 0.05);

            materialRef.current.color.lerp(new Color("orange"), 0.05);
            api.position.set(...lerped.toArray());
        }

        if (status !== prevStatusRef.current && status === "destroyed") {
            api.isTrigger.set(true);
            // if (!materialRef.current) return;
            materialRef.current.visible = false;
        }

        prevStatusRef.current = status;

        const me = provider.awareness.getLocalState();
        if (!me.isAdmin) return;
        const arr = Array.from(hexagonsYMap.entries());
        const isEnded = arr.every(([_, hexStatus]) => hexStatus !== "idle");
        if (!isEnded) return;

        startNewGame();
    });

    return (
        <mesh ref={ref} {...props} receiveShadow castShadow>
            <cylinderGeometry args={args} />
            <meshStandardMaterial ref={materialRef} color={color} />
        </mesh>
    );
};
