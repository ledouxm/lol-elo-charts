import { TextInput } from "@/components/TextInput";
import { useArrayCursor } from "@/hooks/useArrayCursor";
import { Button, Stack, useColorModeValue, useDisclosure } from "@chakra-ui/react";
import { callAll, on, WithOnSubmit } from "@pastable/core";
import { atom, useAtom } from "jotai";
import { useAtomValue } from "jotai/utils";
import { ChangeEvent, FocusEvent, MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { msgsRefAtom } from "./Chat";
import { commandList } from "./ChatCommand";
import { ChatSuggestionsProvider } from "./ChatSuggestionsProvider";

export const ChatForm = ({ onSubmit: onSubmitProp, usernameInputRef }: ChatFormProps) => {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ChatFormValues>({
        defaultValues: { msg: "" },
    });

    const emptyField = () => reset({ msg: "" });
    const resetState = () => callAll(emptyField, closeSuggestions, historyCursor.reset)();

    const [showSuggestions, setShowSuggestions] = useState(false);
    const openSuggestions = () => setShowSuggestions(true);
    const closeSuggestions = () => setShowSuggestions(false);

    const showCommandList = useDisclosure();

    const onSubmit = (values: ChatFormValues) => {
        const isValidMsg = onSubmitProp(values);
        if (!isValidMsg) return;

        resetState();
    };
    const onInput = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (!value.startsWith("/")) {
            if (showSuggestions) {
                closeSuggestions();
            }
            return;
        }

        if (!value) {
            resetState();
            return;
        }

        // Close suggestions if command was fully typed
        const state = extractCommandState(value);
        if (state.hasNoParams || state.hasFilledFirstParam || state.hasFilledSecondParam) {
            closeSuggestions();
            return;
        }

        if (!showSuggestions) {
            openSuggestions();
        }
    };
    const onFocus = (_event: FocusEvent) =>
        value.startsWith("/") &&
        hasFilledCommandSecondParam(value) === undefined &&
        !showSuggestions &&
        openSuggestions();

    // Used to filter the suggestion list
    const value = watch("msg", "");
    const focusInput = () => usernameInputRef.current?.focus();

    // Used to loop through whisper history with up/down keys
    const historyCursor = useWhisperHistory(usernameInputRef.current, !showSuggestions);

    const onCommandListBtnClick =
        showSuggestions || showCommandList.isOpen
            ? callAll(showCommandList.onClose, closeSuggestions)
            : callAll(showCommandList.onOpen, openSuggestions);

    const commandListBtnRef = useRef<HTMLButtonElement>();

    const chatContextProps = {
        value: showCommandList.isOpen ? "/" : value,
        setValue: (value: string) => setValue("msg", value),
        openSuggestions,
        closeSuggestions,
        focusInput,
        inputElement: usernameInputRef.current,
        commandListBtnRef,
    };

    const bg = useColorModeValue("gray.500", "gray.600");
    const msg = register("msg", { maxLength: 200 });

    return (
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            <Stack mt="auto" position="relative">
                {showSuggestions && <ChatSuggestionsProvider {...chatContextProps} />}
                <TextInput
                    placeholder="Send a message !"
                    error={errors.msg}
                    {...msg}
                    ref={(el) => {
                        msg.ref(el);
                        usernameInputRef.current = el;
                    }}
                    onChange={(e) => {
                        msg.onChange(e);
                        onInput(e);
                    }}
                    onFocus={onFocus}
                />
                <Stack direction="row" justifyContent="flex-end">
                    <Button bg={bg} onClick={onCommandListBtnClick} ref={commandListBtnRef}>
                        Commands
                    </Button>
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

function extractCommandState(value: string) {
    const hasSpace = value.includes(" ");
    const [command, firstParam, secondParam] = value.split(" ");

    const cmd = commandList.find((item) => value.startsWith(`/${item.command}`));

    const hasNoParams = cmd && !cmd.param;
    const hasFilledFirstParam = cmd?.param && firstParam;
    const hasFilledSecondParam = cmd?.secondParam && secondParam;

    const state = {
        value,
        cmd,
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
