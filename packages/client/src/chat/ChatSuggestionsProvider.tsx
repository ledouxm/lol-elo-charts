import { Box } from "@chakra-ui/react";
import { useClickAway } from "@pastable/core";
import { MutableRefObject, createContext, useRef } from "react";

import { RelativePortal, RelativePortalProps } from "@/components/RelativePortal";
import { ChatCommandSuggestions } from "./ChatCommandSuggestions";
import { ChatUsernameSuggestions } from "./ChatUsernameSuggestions";
import { AnyState } from "@/functions/xstate";
import { ChatCommandName } from "./ChatCommand";

export const ChatSuggestionsContext = createContext<ChatSuggestionsContextProps>(null);

interface ChatSuggestionsContextProps {
    state: AnyState;
    value: string;
    setValue: (value: string) => void;
    openSuggestions: () => void;
    closeSuggestions: () => void;
    focusInput: () => void;
    inputElement: HTMLDivElement;
    commandListBtnRef: MutableRefObject<HTMLButtonElement>;
}

// Handle container placement using PopperJS & manager when and which suggestions should be shown
export const ChatSuggestionsProvider = (props: ChatSuggestionsContextProps) => {
    const { state, value, closeSuggestions, inputElement } = props;

    // Allow navigation using Up & Down keys
    const resultListRef = useRef<HTMLDivElement>();

    useClickAway({ current: inputElement }, (event) => {
        const target = event.target as Node;
        // Also clicking outside of result list
        if (!resultListRef.current?.contains(target) && !props.commandListBtnRef.current?.contains(target)) {
            closeSuggestions();
        }
    });

    const canShowCommandList = !value.includes(" ");
    const canShowUsernameList = [ChatCommandName.Whisper, ChatCommandName.Kick].some((commandName) =>
        value.startsWith(`/${commandName} `)
    );
    const shouldShowSuggestions =
        state.matches("filled.suggestions.opened") &&
        state.matches("filled.message.command") &&
        (canShowCommandList || canShowUsernameList);

    return (
        <RelativePortal {...{ referenceElement: inputElement, options: popperOptions }}>
            {shouldShowSuggestions && (
                <ChatSuggestionsContext.Provider value={props}>
                    <Box w="100%" bgColor="#1f1f1e" ref={resultListRef}>
                        {canShowCommandList && <ChatCommandSuggestions resultListRef={resultListRef} />}
                        {value.startsWith(`/${ChatCommandName.Whisper} `) && (
                            <ChatUsernameSuggestions
                                resultListRef={resultListRef}
                                commandName={ChatCommandName.Whisper}
                            />
                        )}
                        {value.startsWith(`/${ChatCommandName.Kick} `) && (
                            <ChatUsernameSuggestions resultListRef={resultListRef} commandName={ChatCommandName.Kick} />
                        )}
                    </Box>
                </ChatSuggestionsContext.Provider>
            )}
        </RelativePortal>
    );
};

const popperOptions: RelativePortalProps["options"] = {
    placement: "bottom-start",
    modifiers: [{ name: "offset", options: { offset: [0, 20] } }],
};
