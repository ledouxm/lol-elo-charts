import { TextInput } from "@/components/TextInput";
import { getStateValuePath } from "@/functions/xstate";
import { Button, Stack } from "@chakra-ui/react";
import { WithOnSubmit } from "@pastable/core";
import { useMachine } from "@xstate/react";
import { ChangeEvent, FormEvent, MutableRefObject, useRef } from "react";
import { getChatFormMachine } from "./chatFormMachine";
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
