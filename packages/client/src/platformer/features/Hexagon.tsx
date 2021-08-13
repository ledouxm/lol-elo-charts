import { hexagonsAtom } from "@/components/AppSocket";
import { getRandomColor } from "@/functions/utils";
import { useSocketEmit, useSocketEvent } from "@/hooks/useSocketConnection";
import { makeArrayOf } from "@pastable/react/node_modules/@pastable/utils";
import { Triplet, useCylinder } from "@react-three/cannon";
import { useHelper } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { MeshProps } from "@react-three/fiber";
import { useAtomValue } from "jotai/utils";
import { nanoid } from "nanoid";
import { useEffect, useMemo } from "react";
import { useState } from "react";
import { useRef } from "react";
import { ArrowHelper, AxesHelper, Color, MeshStandardMaterial, Vector3 } from "three";
import { Pit } from "../components/Background";

const min = -0.05;
const max = 0.1;

const getSaturedColor = (hexColor: string) => {
    const color = Number("0x" + hexColor.slice(1));

    const random = Math.random() * (max - min) + min;

    return new Color(color).offsetHSL(0, 0, random);
};

const factor = 0.8660254;

const parentSize = 2.1;
const parentHeight = parentSize * 2 * factor;

const size = 2;
const disappearDelay = 1000;

const hexagonsPerRow = [3, 6, 9, 10, 11, 10, 11, 10, 9, 6, 3];
export const nbHexagons = hexagonsPerRow.reduce((acc) => acc + 1);

const zOffset = ((hexagonsPerRow.length - 1) * Math.sqrt(3) * (parentHeight / 2)) / 2;

const coordsFromId = (id: string): Triplet => {
    const [floor, row, column] = id.split(",").map(Number);
    return [
        column * parentHeight - (hexagonsPerRow[row] * parentHeight) / 2,
        -10 * floor,
        (row * Math.sqrt(3) * parentHeight) / 2 - zOffset,
    ];
    // return [row * parentHeight, -10, (column * Math.sqrt(3) * parentHeight) / 2 - zOffset];
};

export const HexagonGrid = () => {
    const hexagons = useAtomValue(hexagonsAtom);
    const ref = useRef(null);

    const nbFloors = useMemo(
        () => Math.max(...hexagons.map((hex) => hex.id.split(",")[0]).map(Number)) + 1,
        [hexagons]
    );

    return (
        <>
            <axesHelper args={[5]} />
            {/* <mesh ref={ref} position={[0, 0, 0]}></mesh> */}
            {hexagons.map((hex) => {
                const color = colors[hex.id.split(",")[0]] || getRandomColor();
                const newColor = Math.random() > 0.5 ? new Color(color) : getSaturedColor(color);

                return (
                    <Hexagon
                        key={hex.id}
                        color={newColor}
                        position={coordsFromId(hex.id)}
                        id={hex.id}
                        status={hex.status}
                    />
                );
            })}
            <Pit y={nbFloors * -10 - 10} />
        </>
    );
};
const colors = ["#003049", "#6B2C39", "#A12A31", "#D62828", "#E75414"];

export const startNewGame = () => {
    // hexagonsYMap.clear();
    // for (let floorIndex = 0; floorIndex < nbFloors; floorIndex++) {
    //     hexagonsPerRow.forEach((nb, index) => {
    //         for (let subIndex = 0; subIndex < nb; subIndex++) {
    //             hexagonsYMap.set(makeHexagonId(floorIndex, index, subIndex), "idle");
    //         }
    //     });
    // }
};

export const Hexagon = ({
    position,
    color,
    id,
    status,
    ...props
}: { color: Color | string; status: string; id: string } & Omit<MeshProps, "id">) => {
    const args = [size, size, 0.5, 6] as any;

    const statusRef = useRef("idle");
    const prevStatusRef = useRef("");
    const materialRef = useRef<MeshStandardMaterial>(null);

    useSocketEvent("H", (data: any[]) => {
        const [hexId, newStatus] = data;

        if (hexId !== id) return;

        statusRef.current = newStatus;
    });

    useEffect(() => {
        if (statusRef.current === status) return;
        statusRef.current = status;
    }, [status]);

    const emit = useSocketEmit();

    const [ref, api] = useCylinder(() => ({
        type: "Static",
        //@ts-ignore
        position: position,
        onCollide: () => {
            if (statusRef.current === "idle") {
                emit("H", [id, "disappearing"]);
                statusRef.current = "disappearing";
                // hexagonsYMap.set(id, "disappearing");
                setTimeout(() => {
                    statusRef.current = "destroyed";
                    // hexagonsYMap.set(id, "destroyed");
                    // api.collisionResponse.set(0);
                }, disappearDelay);
            }
        },
        args,
    }));

    useFrame(() => {
        if (statusRef.current !== prevStatusRef.current && statusRef.current === "idle") {
            api.isTrigger.set(false);
            // @ts-ignore
            api.position.set(...position);

            materialRef.current.visible = true;
            materialRef.current.color.set(color);
        }

        if (statusRef.current === "disappearing") {
            const dest = new Vector3(position[0], position[1] - 0.2, position[2]);
            const lerped = ref.current.position.lerp(dest, 0.05);

            materialRef.current.color.lerp(new Color("orange"), 0.05);
            api.position.set(...lerped.toArray());
        }

        if (statusRef.current !== prevStatusRef.current && statusRef.current === "destroyed") {
            api.isTrigger.set(true);
            // if (!materialRef.current) return;
            materialRef.current.visible = false;
        }

        prevStatusRef.current = statusRef.current;

        // startNewGame();
    });

    return (
        <mesh ref={ref} {...props} receiveShadow castShadow>
            <cylinderGeometry args={args} />
            <meshStandardMaterial ref={materialRef} color={color} />
        </mesh>
    );
};
