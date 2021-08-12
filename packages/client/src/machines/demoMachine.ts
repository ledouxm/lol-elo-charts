import { Room } from "@/types";
import { snapshot } from "valtio";

import { assign, createMachine } from "xstate";

export function getDemoMachine({ game, room, getRoomSnap, getGameSnap }: DemoContext) {
    return createMachine<DemoContext, DemoEvents>(
        {
            initial: "waiting",
            context: { room: snapshot(room), game: snapshot(game), getRoomSnap, getGameSnap },
            states: {
                waiting: { on: { PLAY: { target: "playing", cond: "canStart" } } },
                playing: {
                    on: {
                        PLAY: { target: "done", cond: "canEnd" },
                        MARK_DONE: { actions: ["markAsDone", "applyContext"] },
                    },
                },
                done: { on: { PLAY: { target: "waiting", actions: ["resetMark", "applyContext"] } } },
            },
            on: { APPLY_CTX: { actions: "applyContext" } },
        },
        {
            actions: {
                applyContext: assign({
                    // room: (ctx) => ctx.getRoomSnap(),
                    // game: (ctx) => ctx.getGameSnap(),
                    room: (ctx) => snapshot(room),
                    game: (ctx) => snapshot(game),
                }),
                markAsDone: (ctx) => (game.mark = true),
                resetMark: (ctx) => (game.mark = false),
            },
            guards: {
                canStart: (ctx) => ctx.room.clients.length > 1,
                canEnd: (ctx) => ctx.game.mark,
            },
        }
    );
}

export interface DemoContext {
    game: Game;
    room: Room;
    getRoomSnap: () => Room;
    getGameSnap: () => Game;
}
interface Game {
    mark?: boolean;
}

export type DemoEvents = { type: "PLAY" } | { type: "APPLY_CTX" } | { type: "MARK_DONE" };
