import { useMyPresence } from "@/hooks/usePresence";
import { LobbyRoomInterface, useRoomContext } from "@/room/LobbyRoom";
import { Player } from "@/types";
import { KeyboardEvent, MouseEvent, useContext } from "react";
import {
    ChatSuggestionListItem,
    ChatSuggestionsList,
    useChatSuggestions,
    UseChatSuggestionsFilterFnProps,
    UseChatSuggestionsProps,
} from "./ChatSuggestions";
import { ChatSuggestionsContext } from "./ChatSuggestionsProvider";

const filterFn = ({ value, item }: UseChatSuggestionsFilterFnProps<Player["username"]>) =>
    item.startsWith(value.replace("/w ", "").toLowerCase());

export const ChatUsernameSuggestions = ({ resultListRef }: Pick<UseChatSuggestionsProps, "resultListRef">) => {
    const { setValue, closeSuggestions, focusInput } = useContext(ChatSuggestionsContext);

    const usernames = useLobbyUsernames();
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

// Using a Set here allow de-duplicating usernames
export const getLobbyUsernames = (lobby: LobbyRoomInterface, me: Player) =>
    Array.from(new Set(lobby?.clients.filter((item) => item.id !== me.id).map((item) => item.username.toLowerCase())));
export const useLobbyUsernames = () => {
    const me = useMyPresence();
    const lobby = useRoomContext();
    const usernames = getLobbyUsernames(lobby, me);

    return usernames;
};
