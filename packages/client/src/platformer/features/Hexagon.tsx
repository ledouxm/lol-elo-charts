import { Triplet, useCylinder } from "@react-three/cannon";
import { MeshProps, useFrame } from "@react-three/fiber";
import { atom } from "jotai";
import { useAtomValue } from "jotai/utils";
import { useContext, useEffect, useMemo, useRef } from "react";
import { Color, MeshStandardMaterial, Vector3 } from "three";

import { getRandomColor } from "@/functions/utils";
import { useGameRoomRef } from "@/socket/useGameRoomState";
import { useSocketEmit, useSocketEvent } from "@/socket/useSocketConnection";

import { Pit } from "../components/Background";
import { sliceColor } from "./character/Character";
import { PlatformerContext } from "./PlatformerCanvas";

const min = -0.05;
const max = 0.1;

const getHexagonColorShade = (hexColor: string) => {
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

export type HexagonStatus = "idle" | "disappearing" | "destroyed";

export interface Hexagon extends Record<string, HexagonStatus> {}

export const hexagonsAtom = atom<Hexagon>({});

export const HexagonGrid = () => {
    const hexagons = useAtomValue(hexagonsAtom);

    const cptRef = useRef(0);

    const nbFloors = useMemo(
        () =>
            Math.max(
                ...Object.keys(hexagons)
                    .map((id) => id.split(",")[0])
                    .map(Number)
            ) + 1,
        [hexagons]
    );

    const hexagonsBlocks = useMemo(() => Object.entries(hexagons), [hexagons]);

    useEffect(() => {
        cptRef.current++;
    }, [hexagons]);
    if (!hexagons) return null;

    return (
        <>
            <axesHelper args={[5]} />
            {/* <mesh ref={ref} position={[0, 0, 0]}></mesh> */}
            {hexagonsBlocks.map(([id, status]) => {
                const color = sliceColor(colors[Number(id.split(",")[0])] || getRandomColor());
                const newColor = Math.random() > 0.5 ? color : getHexagonColorShade(color);

                return (
                    <HexagonBlock
                        key={id + "-" + cptRef.current}
                        color={newColor}
                        position={coordsFromId(id)}
                        id={id}
                        status={status}
                    />
                );
            })}
            <Pit y={(nbFloors === -Infinity ? 0 : nbFloors) * -10 - 10} />
        </>
    );
};
const colors = ["#00304900", "#6B2C3900", "#A12A3100", "#D6282800", "#E7541400"];

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

export const HexagonBlock = ({
    position,
    color,
    id,
    ...props
}: { color: string | Color; status: string; id: string } & Omit<MeshProps, "id">) => {
    const args = [size, size, 0.5, 6] as any;

    const statusRef = useRef("idle");
    const prevStatusRef = useRef("");
    const materialRef = useRef<MeshStandardMaterial>(null);
    const { gameName } = useContext(PlatformerContext);
    const gameRoom = useGameRoomRef(gameName);

    useSocketEvent("games/update.meta:hexagons#" + gameName, (data: string) => {
        const myUpdate = Object.entries(data).find(([hexId]) => hexId === id);

        if (!myUpdate) return;

        statusRef.current = myUpdate[1];
    });

    // useEffect(() => {
    //     console.log("new", status);
    //     if (statusRef.current === status) return;
    //     statusRef.current = status;
    // }, [status]);

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
                // emit("games.update.meta:hexagons#" + gameName, { [id]: "disappearing" });
                gameRoom.updateMeta({ [id]: "disappearing" }, "hexagons");

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
