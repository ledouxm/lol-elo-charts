import { useMyPresence } from "@/hooks/usePresence";
import { LobbyRoomInterface, useRoomContext } from "@/room/LobbyRoom";
import { Player } from "@/types";
import { KeyboardEvent, MouseEvent, useContext, useMemo } from "react";
import { ChatCommandName } from "./ChatCommand";
import {
    ChatSuggestionListItem,
    ChatSuggestionsList,
    useChatSuggestions,
    UseChatSuggestionsFilterFnProps,
    UseChatSuggestionsProps,
} from "./ChatSuggestions";
import { ChatSuggestionsContext } from "./ChatSuggestionsProvider";

export const ChatUsernameSuggestions = ({
    resultListRef,
    commandName,
}: Pick<UseChatSuggestionsProps, "resultListRef"> & { commandName: ChatCommandName }) => {
    const { setValue, closeSuggestions, focusInput } = useContext(ChatSuggestionsContext);

    const usernames = useLobbyUsernames();
    const selectUsername = (index: number, event: KeyboardEvent | MouseEvent) => {
        if (!suggestions[index]) return;

        setValue(`/${commandName} ${suggestions[index]} `);
        closeSuggestions();
        event.type === "click" && focusInput();
    };

    const filterFn = ({ value, item }: UseChatSuggestionsFilterFnProps<Player["username"]>) =>
        item.toLowerCase().startsWith(value.replace(`/${commandName} `, "").toLowerCase());

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
            emptyLabel="User not found in lobby."
        />
    );
};

// Using a Set here allow de-duplicating usernames
const getLobbyUsernames = (lobby: LobbyRoomInterface, me: Player) =>
    Array.from(new Set((lobby?.clients || []).filter((item) => item.id !== me.id).map((item) => item.username)));
export const useLobbyUsernames = () => {
    const me = useMyPresence();
    const lobby = useRoomContext();
    const usernames = useMemo(() => getLobbyUsernames(lobby, me), [lobby.clients.length, me]);

    return usernames;
};
