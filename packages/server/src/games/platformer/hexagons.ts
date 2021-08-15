export const makeHexagonId = (floorIndex: number, index: number, subIndex: number) =>
    [floorIndex, index, subIndex].join(",");
export const hexagonsPerRow = [3, 6, 9, 10, 11, 10, 11, 10, 9, 6, 3];

// export const changeHexStatus = (arr: [id: string, newStatus: string], ws: AppWebsocket) => {
//     const [hexId, status] = arr;
//     const hex = hexMap.get(hexId);
//     hex.status = status;

//     if (status === "disappearing") {
//         setTimeout(() => {
//             changeHexStatus([hexId, "destroyed"], ws);
//         }, 1000);
//     }
// };

// export const makeInitialHexagons = (nbFloors: number) => {
//     const hexagons = [...hexMap.entries()].map(([id, { status }]) => [id, status]);

// };

export type HexagonStatus = "idle" | "disappearing" | "destroyed";
export const makeInitialHexagonsMap = (nbFloors: number) => {
    const hexMap = new Map<string, HexagonStatus>();

    hexMap.clear();
    for (let floorIndex = 0; floorIndex < nbFloors; floorIndex++) {
        hexagonsPerRow.forEach((nb, index) => {
            for (let subIndex = 0; subIndex < nb; subIndex++) {
                hexMap.set(makeHexagonId(floorIndex, index, subIndex), "idle");
            }
        });
    }

    return hexMap;
};

export interface Hexagon {
    status: string;
}
