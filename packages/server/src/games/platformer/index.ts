import { getRoomMeta } from "@/helpers";
import { GameHooks, GameRoom } from "@/types";
import { sendMsg } from "@/ws-helpers";

import { Hexagon, makeInitialHexagonsMap } from "./hexagons";

export interface PlatformerMeta extends Map<string, any> {}
export interface PlatformerState extends Map<string, number[][]> {}

export interface PlatformerGameRoom extends GameRoom<PlatformerMeta, PlatformerState> {}

export interface PlatformerHooks extends GameHooks<PlatformerGameRoom> {}

const nbFloors = 1;

export const platformerHooks: PlatformerHooks = {
    "games.create": ({ ws, game }) => {
        const hexagonsMap = makeInitialHexagonsMap(nbFloors);
        game.meta.set("hexagons", hexagonsMap);

        const hexagons = Object.fromEntries(hexagonsMap);

        sendMsg(ws, ["games/get.meta#" + game.name, { hexagons }]);
    },
    "games.join": ({ ws, game }) => {
        const meta = formatPlatformerMeta(game.meta);
        sendMsg(ws, ["games/get.meta#" + game.name, meta]);
    },
    "games.update.meta": ({ game, ws }, payload: Partial<PlatformerMeta>) => {
        game.clients.forEach((client) => sendMsg(client, ["games/update.meta:hexagons#" + game.name, payload]));

        setTimeout(() => {
            // set hex status to destroyed after a delay
            const id = Object.keys(payload)[0];
            const hexagons = game.meta.get("hexagons");
            hexagons.set(id, "destroyed");

            game.clients.forEach((client) =>
                sendMsg(client, ["games/update.meta:hexagons#" + game.name, { [id]: "destroyed" }])
            );

            // if every hex has destroyed status -> start a new game
            const isEnded = [...hexagons.values()].every((hex) => hex === "destroyed");

            if (!isEnded) return;
            const hexagonsMap = makeInitialHexagonsMap(nbFloors);
            game.meta.set("hexagons", hexagonsMap);

            const newHexagons = Object.fromEntries(hexagonsMap);
            sendMsg(ws, ["games/get.meta#" + game.name, { hexagons: newHexagons }]);
        }, 1000);
    },
};

const formatPlatformerMeta = (meta: PlatformerMeta) => ({
    hexagons: Object.fromEntries(meta.get("hexagons")),
});
