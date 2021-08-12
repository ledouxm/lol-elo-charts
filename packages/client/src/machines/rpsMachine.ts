import { Game, Player } from "@/types";
import { findBy, updateItem } from "@pastable/core";
import { snapshot, subscribe } from "valtio";

import { assign, createMachine } from "xstate";

export function getRpsMachine({ game }: Partial<RpsContext>) {
    return createMachine<RpsContext, RpsEvents>(
        {
            initial: "waiting",
            entry: () => console.log("entry"),
            context: { game: undefined, players: [], winner: undefined },
            states: {
                waiting: {
                    entry: "reset",
                    on: {
                        JOIN: [
                            { internal: true, actions: "setPlayer" },
                            { target: "playing", cond: "canStart" },
                        ],
                    },
                },
                playing: {
                    on: {
                        PLAY: [
                            { internal: true, actions: "setMove" },
                            { target: "done", cond: "hasWinner" },
                            { target: "waiting" },
                        ],
                    },
                },
                done: { entry: "setWinner", on: { RESTART: { target: "waiting", actions: "reset" } } },
            },
            on: { APPLY_CTX: { actions: "applyContext" } },
            invoke: {
                id: "starter",
                src: (ctx, event) => (send, onReceived) => {
                    send("JOIN");
                    subscribe(game.players, () => send("JOIN"));
                },
            },
        },
        {
            actions: {
                applyContext: assign({ game: (ctx) => snapshot(game) }),
                setMove: assign({
                    players: (ctx, event) => {
                        // event.type === "PLAY"
                        // ? updateItem(ctx.players, "id", {
                        //       ...(findBy(ctx.players, "id", event.id) as RpsPlayer),
                        //       move: event.move,
                        //   })
                        // : ctx.players
                        if (event.type !== "PLAY") return;
                        const clone = [...ctx.players];
                        const move = event.move;
                        const player = findBy(ctx.players, "id", event.id) as RpsPlayer;
                        updateItem(clone, "id", { ...player, move });
                        console.log(ctx.players, event, player);
                        return clone;
                    },
                }),
                setWinner: assign({
                    winner: (ctx) => ctx.game.players[comparePlayerMoves(ctx.players) === "win" ? 0 : 1],
                }),
                reset: (ctx) =>
                    (ctx.players = ctx.game.players.map((player) => ({ move: undefined, status: "waiting" }))),
            },
            guards: {
                canStart: (ctx) => ctx.game.players.length === 2,
                hasWinner: (ctx) => console.log(ctx.players) || comparePlayerMoves(ctx.players) !== "draw",
            },
        }
    );
}

interface RpsContext {
    game: Game;
    players: Array<RpsPlayer>;
    winner: Player;
}
interface RpsPlayer {
    move: "rock" | "paper" | "scissors";
    status: "ready" | "waiting" | "playing";
}
type RpsMove = RpsPlayer["move"];
type RpsEvents =
    | { type: "APPLY_CTX" }
    | { type: "JOIN" }
    | { type: "PLAY"; move: RpsMove; id: Player["id"] }
    | { type: "RESTART" };

type RpsMoveResult = "win" | "draw" | "lose";

const compareMoves = (left: RpsMove, right: RpsMove) => resultByMoves[left][right];
const comparePlayerMoves = ([left, right]: Array<RpsPlayer>) => compareMoves(left.move, right.move);

const resultByMoves: Record<RpsMove, Record<RpsMove, RpsMoveResult>> = {
    rock: {
        scissors: "win",
        rock: "draw",
        paper: "lose",
    },
    paper: {
        rock: "win",
        paper: "draw",
        scissors: "lose",
    },
    scissors: {
        paper: "win",
        scissors: "draw",
        rock: "lose",
    },
};
