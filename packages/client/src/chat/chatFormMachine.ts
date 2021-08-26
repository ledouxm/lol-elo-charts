import { MutableRefObject } from "react";
import { createMachine } from "xstate";
import { assign } from "xstate";
import { commandList } from "./ChatCommand";

export const getChatFormMachine = ({ inputRef }: { inputRef: MutableRefObject<HTMLInputElement> }) =>
    createMachine(
        {
            id: "chatForm",
            context: { value: "", inputRef, history: [] },
            initial: "idle",
            states: {
                idle: {
                    on: {
                        INPUT: [
                            { target: "filled.withCommand", cond: "hasCommand", actions: "input" },
                            { target: "filled.withMessage", actions: "input" },
                        ],
                    },
                },
                filled: {
                    initial: "withCommand",
                    states: {
                        withCommand: {
                            initial: "withSuggestions",
                            states: {
                                typing: {
                                    on: {
                                        OPEN_SUGGESTIONS: {
                                            target: "withSuggestions.opened",
                                            cond: "canShowSuggestions",
                                        },
                                        INPUT: {
                                            target: "withSuggestions.opened",
                                            cond: "canShowSuggestions",
                                            actions: "input",
                                        },
                                    },
                                },
                                withSuggestions: {
                                    initial: "opened",
                                    states: {
                                        opened: {
                                            on: {
                                                CLOSE_SUGGESTIONS: { target: "closed" },
                                                INPUT: {
                                                    target: "closed",
                                                    cond: "canNOTShowSuggestions",
                                                    actions: "input",
                                                },
                                            },
                                        },
                                        closed: {
                                            on: {
                                                OPEN_SUGGESTIONS: { target: "opened", cond: "canShowSuggestions" },
                                                INPUT: {
                                                    target: "opened",
                                                    cond: "canShowSuggestions",
                                                    actions: "input",
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            on: { MOVE_CURSOR: { actions: "moveCursor" } },
                        },
                        withMessage: {},
                    },
                    // TODO
                    on: { SUBMIT: { target: "idle", actions: "submit" } },
                },
            },
            on: {
                INPUT: [
                    { target: "idle", actions: ["resetInput", "resetValue"], cond: "isValueEmpty" },
                    { actions: ["input"] },
                ],
                SET_VALUE: { actions: ["setValue", "setInput"] },
                RESET: { target: "idle", actions: ["resetInput", "resetValue"] },
            },
        },
        {
            actions: {
                input: assign({ value: (ctx, event) => event.value }),
                moveCursor: (ctx, event) => {}, // TODO
                submit: (ctx, event) => {}, // TODO,
                setInput: (ctx, event) => (ctx.inputRef.current.value = event.value),
                setValue: assign({ value: (ctx, event) => event.value }),
                resetInput: (ctx, event) => (ctx.inputRef.current.value = ""),
                resetValue: assign({ value: "" }),
            },
            guards: {
                isValueEmpty: (ctx, event) => !Boolean(event.value),
                hasCommand: (ctx, event) => event.value.startsWith("/"),
                canShowSuggestions: (ctx, event) => canShowSuggestions(event.value || ctx.value),
                canNOTShowSuggestions: (ctx, event) => !canShowSuggestions(event.value || ctx.value),
            },
        }
    );

const isCommandFullyTyped = (state: ReturnType<typeof extractCommandState>) =>
    Boolean(state.hasNoParams || (state.hasFilledFirstParam && state.hasFilledSecondParam));
const canShowSuggestions = (value: string) => {
    // Empty input
    if (!value) return false;

    // Displaying the list of commands
    if (value === "/") return true;

    const state = extractCommandState(value);

    // Started typing a command name
    if (state.hasCommandThatStartsWith && !state.hasSpace) return true;

    // Wrong command name
    // ex: "/whoops"
    if (!state.hasCommand) return false;

    // Command fully typed
    // ex: "/w player1 message"
    if (isCommandFullyTyped(state)) return false;

    // Command incomplete but has filled the first param and is going to fill the second
    // ex: "/w player1 "
    if (value.endsWith(" ")) {
        // const willTypeFirstParam = state.hasCommand && !state.hasFilledFirstParam;
        const willTypeSecondParam = state.hasFilledFirstParam && !state.hasFilledSecondParam;
        if (willTypeSecondParam) return false;
    }

    return true;
};

export function extractCommandState(value: string) {
    const hasSpace = value.includes(" ");
    const [command, firstParam, secondParam] = value.split(" ");

    const hasCommandThatStartsWith = commandList.some((item) => item.command.startsWith(value.replace("/", "")));
    const cmd = commandList.find((item) => value.startsWith(`/${item.command}`));

    const hasNoParams = cmd && !cmd.param;
    const hasFilledFirstParam = cmd?.param && firstParam;
    const hasFilledSecondParam = cmd?.secondParam && secondParam;

    const state = {
        value,
        cmd,
        hasCommandThatStartsWith,
        hasCommand: Boolean(cmd),
        hasSpace,
        command,
        firstParam,
        secondParam,
        hasNoParams,
        hasFilledFirstParam,
        hasFilledSecondParam,
    };
    return state;
}
