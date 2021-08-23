import { KeyboardEvent, MouseEvent, useContext } from "react";

import { ChatCommand, ChatCommandData, commandList } from "./ChatCommand";
import {
    ChatSuggestionsList,
    UseChatSuggestionsFilterFnProps,
    UseChatSuggestionsProps,
    useChatSuggestions,
} from "./ChatSuggestions";
import { ChatSuggestionsContext } from "./ChatSuggestionsProvider";

const filterFn = ({ value, item }: UseChatSuggestionsFilterFnProps<ChatCommandData>) =>
    item.command.startsWith(value.slice(1).toLowerCase());

export const ChatCommandSuggestions = ({ resultListRef }: Pick<UseChatSuggestionsProps, "resultListRef">) => {
    const { setValue, closeSuggestions, focusInput } = useContext(ChatSuggestionsContext);
    const items = commandList;

    const selectCommand = (index: number, event: KeyboardEvent | MouseEvent) => {
        if (!suggestions[index]) return;

        setValue(`/${suggestions[index].command}${suggestions[index].param ? " " : ""}`);
        if (!suggestions[index].secondParam) {
            closeSuggestions();
        }
        event.type === "click" && focusInput();
    };
    const suggestions = useChatSuggestions({
        items,
        filterFn,
        resultListRef,
        activableSelector: ".suggestion",
        onEnterKeyDown: selectCommand,
        onTabKeyDown: selectCommand,
    });

    return (
        <ChatSuggestionsList
            suggestions={suggestions}
            renderItem={(item, index) => (
                <ChatCommand key={item.command} {...item} onClick={(event) => selectCommand(index, event)}>
                    {item.description}
                </ChatCommand>
            )}
            emptyLabel="No command found."
        />
    );
};
