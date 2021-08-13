import { AppWebsocket, ref } from "./app";

export const makeHexagonId = (floorIndex: number, index: number, subIndex: number) =>
    [floorIndex, index, subIndex].join(",");
export const hexMap = new Map<string, { status: string }>();
export const hexagonsPerRow = [3, 6, 9, 10, 11, 10, 11, 10, 9, 6, 3];
export const nbFloors = 1;

export const changeHexStatus = (arr: [id: string, newStatus: string], ws: AppWebsocket) => {
    const [hexId, status] = arr;
    const hex = hexMap.get(hexId);
    hex.status = status;

    if (status === "disappearing") {
        setTimeout(() => {
            changeHexStatus([hexId, "destroyed"], ws);
        }, 1000);
    }

    ref.wss.clients.forEach((client) => {
        if (client.id === ws.id) return;
        client.send(JSON.stringify(["H", [hexId, status]]));
    });
};

export const sendInitialHexagons = (ws: AppWebsocket) => {
    const hexagons = [...hexMap.entries()].map(([id, { status }]) => [id, status]);

    ws.send(JSON.stringify(["INITIAL_H", hexagons]));
};

export const startNewGame = () => {
    hexMap.clear();
    for (let floorIndex = 0; floorIndex < nbFloors; floorIndex++) {
        hexagonsPerRow.forEach((nb, index) => {
            for (let subIndex = 0; subIndex < nb; subIndex++) {
                hexMap.set(makeHexagonId(floorIndex, index, subIndex), { status: "idle" });
            }
        });
    }
};

startNewGame();
