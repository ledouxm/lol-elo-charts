import { getRoomMeta } from "@/helpers";
import { GameHooks, GameRoom } from "@/types";
import { sendMsg } from "@/ws-helpers";
import { makeInitialHexagonsMap, Hexagon } from "./hexagons";

export interface PlatformerMeta extends Map<string, any> {}
export interface PlatformerState extends Map<string, number[][]> {}

export interface PlatformerGameRoom extends GameRoom<PlatformerMeta, PlatformerState> {}

export interface PlatformerHooks extends GameHooks<PlatformerGameRoom> {}
export const platformerHooks: PlatformerHooks = {
    "games.create": ({ ws, game }) => {
        const hexagonsMap = makeInitialHexagonsMap(5);
        game.meta.set("hexagons", hexagonsMap);

        const hexagons = Object.fromEntries(hexagonsMap);

        sendMsg(ws, ["games/get.meta#" + game.name, { hexagons }]);

        // return { meta: game.meta };
    },
    "games.join": ({ ws, game }) => {
        const meta = formatPlatformerMeta(game.meta);
        sendMsg(ws, ["games/get.meta#" + game.name, meta]);
    },
    "games.update.meta": ({ game }, payload: Partial<PlatformerMeta>) => {
        console.log("update", typeof payload);

        game.clients.forEach((client) => sendMsg(client, ["games/update.meta:hexagons#" + game.name, payload]));
        setTimeout(() => {
            const id = Object.keys(payload)[0];
            game.meta.get("hexagons").set(id, "destroyed");
            game.clients.forEach((client) =>
                sendMsg(client, ["games/update.meta:hexagons#" + game.name, { [id]: "destroyed" }])
            );
        }, 1000);

        // TODO: check end game
        // const hexagons = ctx.game.meta.get("hexagons") as Map<string, Hexagon>;
        // const isEnded = (Object.values(hexagons) as Hexagon[]).every((hex) => hex.status === "destroyed");
    },
};

const formatPlatformerMeta = (meta: PlatformerMeta) => ({
    hexagons: Object.fromEntries(meta.get("hexagons")),
});
