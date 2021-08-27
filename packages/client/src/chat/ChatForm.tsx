import { TextInput } from "@/components/TextInput";
import { getStateValuePath } from "@/functions/xstate";
import { useArrayCursor } from "@/hooks/useArrayCursor";
import { Button, Stack, useColorModeValue } from "@chakra-ui/react";
import { on, WithOnSubmit } from "@pastable/core";
import { useMachine } from "@xstate/react";
import { useAtomValue } from "jotai/utils";
import { ChangeEvent, FormEvent, MutableRefObject, useCallback, useEffect, useRef } from "react";
import { msgsRefAtom } from "./Chat";
import { extractCommandState, getChatFormMachine } from "./chatFormMachine";
import { ChatSuggestionsProvider } from "./ChatSuggestionsProvider";

export const ChatForm = ({ onSubmit: onSubmitProp, usernameInputRef }: ChatFormProps) => {
    const [state, send] = useMachine(() => getChatFormMachine({ inputRef: usernameInputRef }));
    console.log(getStateValuePath(state), state.context.value);

    const onInput = (e: ChangeEvent<HTMLInputElement>) => send("INPUT", { value: e.target.value });
    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        const isValidMsg = onSubmitProp({ msg: usernameInputRef.current.value });
        if (!isValidMsg) return;

        send("RESET");
    };
    const setValue = (value: string) => send("SET_VALUE", { value });
    const openSuggestions = () => send("OPEN_SUGGESTIONS");
    const closeSuggestions = () => send("CLOSE_SUGGESTIONS");

    // Used to filter the suggestion list
    const value = state.context.value;
    const focusInput = () => usernameInputRef.current?.focus();

    // Used to loop through whisper history with up/down keys
    // const historyCursor = useWhisperHistory(usernameInputRef.current, !showSuggestions);

    const commandListBtnRef = useRef<HTMLButtonElement>();
    const chatContextProps = {
        state,
        value,
        setValue,
        openSuggestions,
        closeSuggestions,
        focusInput,
        inputElement: usernameInputRef.current,
        commandListBtnRef,
    };

    const bg = useColorModeValue("gray.500", "gray.600");

    return (
        <form onSubmit={onSubmit} autoComplete="off">
            <Stack mt="auto" position="relative">
                {state.matches("filled.suggestions") && <ChatSuggestionsProvider {...chatContextProps} />}
                <TextInput
                    placeholder="Send a message ! (type / to see the list of commands"
                    ref={usernameInputRef}
                    onChange={onInput}
                    onFocus={openSuggestions}
                />
                <Stack direction="row" justifyContent="flex-end">
                    <Button type="submit" colorScheme="blue">
                        Send
                    </Button>
                </Stack>
            </Stack>
        </form>
    );
};

export type ChatFormValues = { msg: string };
interface ChatFormProps extends WithOnSubmit<ChatFormValues, boolean> {
    usernameInputRef: MutableRefObject<HTMLInputElement>;
}

const hasFilledCommandSecondParam = (value: string) => extractCommandState(value).hasFilledSecondParam;

function useWhisperHistory(inputElement: HTMLInputElement, enabled: boolean) {
    const msgsRef = useAtomValue(msgsRefAtom);

    // Get unique "to" usernames from sent whispers
    const sentTo = Array.from(new Set(msgsRef.current.map((chat) => chat.self && chat.to).filter(Boolean)));

    const [index, cursor] = useArrayCursor(sentTo.length);

    // Loop through whisper history with up/down, reset input when index === -1
    const openWhisperHistoryWithArrowKeys = useCallback(
        (event: KeyboardEvent) => {
            // No messages sent yet or history disabled
            if (!sentTo.length || !enabled) return;

            // Only allow looping through history if message is a `/w [username]` without message yet
            if (inputElement.value) {
                if (inputElement.value.startsWith("/w ")) {
                    if (hasFilledCommandSecondParam(inputElement.value)) {
                        return;
                    }
                } else {
                    return;
                }
            }

            if (!(event.key === "ArrowUp" || event.key === "ArrowDown")) {
                return;
            }

            event.preventDefault();
            if (event.key === "ArrowUp") {
                index === sentTo.length - 1 ? cursor.reset() : cursor.next();
                return;
            }

            index === 0 ? cursor.reset() : cursor.prev();
        },
        [inputElement, sentTo, cursor, index, enabled]
    );

    // openWhisperHistoryWithArrowKeys
    useEffect(() => {
        if (!inputElement) return;

        return on(inputElement, "keydown", openWhisperHistoryWithArrowKeys);
    }, [inputElement, openWhisperHistoryWithArrowKeys]);

    // Update input value with `/w ${username}` according to array cursor index
    useEffect(() => {
        if (!inputElement || !sentTo.length) return;
        if (!inputElement.value.startsWith("/w ")) return;

        // Reset input on -1
        if (index === -1) {
            inputElement.value = "";
            return;
        }

        const activeTo = sentTo[index];
        inputElement.value = `/w ${activeTo} `;
    }, [inputElement, sentTo, index]);

    return cursor;
}
