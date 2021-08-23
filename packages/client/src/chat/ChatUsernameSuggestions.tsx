import { myPresenceAtom } from "@/hooks/usePresence";
import { lobbyAtom } from "@/room/LobbyRoom";
import { Player } from "@/types";
import { atom } from "jotai";
import { useAtomValue } from "jotai/utils";
import { KeyboardEvent, MouseEvent, useContext } from "react";

import {
    ChatSuggestionListItem,
    ChatSuggestionsList,
    UseChatSuggestionsFilterFnProps,
    UseChatSuggestionsProps,
    useChatSuggestions,
} from "./ChatSuggestions";
import { ChatSuggestionsContext } from "./ChatSuggestionsProvider";

const filterFn = ({ value, item }: UseChatSuggestionsFilterFnProps<Player["username"]>) =>
    item.startsWith(value.replace("/w ", "").toLowerCase());

// Using a Set here allow de-duplicating usernames
export const usernamesAtom = atom((get) => {
    const me = get(myPresenceAtom);
    const lobby = get(lobbyAtom);

    return Array.from(
        new Set(lobby?.clients.filter((item) => item.id !== me.id).map((item) => item.username.toLowerCase()))
    );
});

export const ChatUsernameSuggestions = ({ resultListRef }: Pick<UseChatSuggestionsProps, "resultListRef">) => {
    const { setValue, closeSuggestions, focusInput } = useContext(ChatSuggestionsContext);
    const usernames = useAtomValue(usernamesAtom);

    const selectUsername = (index: number, event: KeyboardEvent | MouseEvent) => {
        if (!suggestions[index]) return;

        setValue(`/w ${suggestions[index]} `);
        closeSuggestions();
        event.type === "click" && focusInput();
    };
    const suggestions = useChatSuggestions({
        items: usernames,
        filterFn,
        resultListRef,
        activableSelector: ".suggestion",
        onEnterKeyDown: selectUsername,
        onTabKeyDown: selectUsername,
    });

    return (
        <ChatSuggestionsList
            suggestions={suggestions}
            renderItem={(item, index) => (
                <ChatSuggestionListItem key={index} onClick={(event) => selectUsername(index, event)}>
                    {item}
                </ChatSuggestionListItem>
            )}
            emptyLabel="User not found in friends/lobby."
        />
    );
};
