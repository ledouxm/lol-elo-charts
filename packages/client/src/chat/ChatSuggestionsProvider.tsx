import { Box } from "@chakra-ui/react";
import { useClickAway } from "@pastable/core";
import React, { MutableRefObject, createContext, useRef } from "react";

import { RelativePortal, RelativePortalProps } from "@/components/RelativePortal";
import { ChatCommandSuggestions } from "./ChatCommandSuggestions";
import { ChatUsernameSuggestions } from "./ChatUsernameSuggestions";

export const ChatSuggestionsContext = createContext<ChatSuggestionsContextProps>(null);

interface ChatSuggestionsContextProps {
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
    const { value, closeSuggestions, inputElement } = props;

    // Allow navigation using Up & Down keys
    const resultListRef = useRef<HTMLDivElement>();

    useClickAway({ current: inputElement }, (event) => {
        const target = event.target as Node;
        // Also clicking outside of result list
        if (!resultListRef.current?.contains(target) && !props.commandListBtnRef.current?.contains(target)) {
            closeSuggestions();
        }
    });

    const popperOptions: RelativePortalProps["options"] = {
        placement: "top-start",
        modifiers: [{ name: "offset", options: { offset: [0, 20] } }],
    };

    const canShowCommandList = !value.includes(" ");
    const canShowUsernameList = value.startsWith("/w ");
    const shouldShowSuggestions = canShowCommandList || canShowUsernameList;

    return (
        <RelativePortal {...{ referenceElement: inputElement, options: popperOptions }}>
            {shouldShowSuggestions && (
                <ChatSuggestionsContext.Provider value={props}>
                    <Box w="100%" bgColor="#1f1f1e" ref={resultListRef}>
                        {canShowCommandList && <ChatCommandSuggestions resultListRef={resultListRef} />}
                        {canShowUsernameList && <ChatUsernameSuggestions resultListRef={resultListRef} />}
                    </Box>
                </ChatSuggestionsContext.Provider>
            )}
        </RelativePortal>
    );
};
