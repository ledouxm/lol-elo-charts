import { Game, Player } from "@/types";
import { findBy } from "@pastable/core";
import { snapshot, subscribe } from "valtio";

import { assign, createMachine } from "xstate";

export function getRpsMachine({ game }: Partial<RpsContext>) {
    return createMachine<any, RpsContext, RpsEvents>(
        {
            initial: "waiting",
            entry: () => console.log("entry"),
            context: { game: undefined },
            states: {
                waiting: {
                    entry: "reset",
                    on: { JOIN: { target: "playing", cond: "canStart" } },
                    invoke: {
                        id: "starter",
                        src: (ctx, event) => (send, onReceived) => {
                            console.log("starter");
                            send("JOIN");
                            subscribe(game.players, () => send("JOIN"));
                        },
                    },
                },
                playing: {
                    // always: [{ target: "done", cond: "hasWinner", actions: ["reset", "setWinner"] }],
                    on: {
                        PLAY: { actions: "setMove" },
                        BOTH_PLAYED: { target: "done", cond: "hasWinner", actions: ["reset", "setWinner"] },
                    },
                    // invoke: {
                    //     id: "hasWinner",
                    //     src: (ctx, event) => (send, onReceived) => {
                    //         console.log("hasWinner");
                    //         return subscribe(game.players, () => {
                    //             send("BOTH_PLAYED");
                    //             // if (!didBothMove(ctx.game.players)) return;
                    //             // console.log(ctx.game.players, didBothMove(ctx.game.players), comparePlayerMoves(ctx.game.players));
                    //             // const result  = comparePlayerMoves(ctx.game.players);
                    //             // if (result === "draw") {

                    //             // }
                    //         });
                    //     },
                    // },
                },
                done: {
                    on: { RESTART: { target: "waiting", actions: "reset" } },
                },
            },
            on: { APPLY_CTX: { actions: "applyContext" } },
        },
        {
            actions: {
                applyContext: assign({ game: (ctx) => snapshot(game) }),
                setMove: (ctx, event) => {
                    if (event.type !== "PLAY") return;
                    const index = findBy(ctx.game.players, "id", event.id, true) as number;
                    console.log(ctx.game.players, event, index, ctx.game.players[index]);
                    game.players[index].move = event.move;
                    game.players[index].status = "moved";
                },
                setWinner: (ctx) => {
                    console.log(
                        "setWinner",
                        comparePlayerMoves(ctx.game.players),
                        ctx.game.players[comparePlayerMoves(ctx.game.players) === "win" ? 0 : 1]
                    );
                    game.winner = ctx.game.players[comparePlayerMoves(ctx.game.players) === "win" ? 0 : 1];
                },
                reset: (ctx, event) => {
                    console.log("reset");
                    ctx.game.players.forEach((player, index) => {
                        game.players[index].move = "none";
                        game.players[index].status = "ready";
                    });
                },
            },
            guards: {
                canStart: (ctx) => ctx.game.players.length === 2,
                hasWinner: (ctx) => {
                    if (!didBothMove(ctx.game.players)) return;
                    console.log(ctx.game.players, didBothMove(ctx.game.players), comparePlayerMoves(ctx.game.players));
                    return didBothMove(ctx.game.players) && comparePlayerMoves(ctx.game.players) !== "draw";
                },
            },
        }
    );
}

interface RpsContext {
    game: RpsGame;
}

interface RpsGame extends Game {
    players: Array<RpsPlayer>;
    winner: RpsPlayer;
}
interface RpsPlayer extends Player {
    move: RpsMove | "none";
    status: "ready" | "moved" | "playing";
}
type RpsMove = "rock" | "paper" | "scissors";
type RpsEvents =
    | { type: "APPLY_CTX" }
    | { type: "JOIN" }
    | { type: "PLAY"; move: RpsMove; id: Player["id"] }
    | { type: "BOTH_PLAYED" }
    | { type: "RESTART" };

type RpsMoveResult = "win" | "draw" | "lose";

const compareMoves = (left: RpsMove, right: RpsMove) => left && right && resultByMoves[left][right];
const comparePlayerMoves = ([left, right]: Array<RpsPlayer>) =>
    compareMoves(left.move as RpsMove, right.move as RpsMove);
const didBothMove = ([left, right]: Array<RpsPlayer>) =>
    Boolean([left?.move && right?.move].filter(Boolean).every((move) => move !== "none"));

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
