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
    const { setValue, focusInput, onSubmit } = useContext(ChatSuggestionsContext);

    const selectCommand = (index: number, event: KeyboardEvent | MouseEvent) => {
        if (!suggestions[index]) return;

        // On selecting a command without param, execute it instantly
        if (!suggestions[index].param) {
            setValue(`/${suggestions[index].command}`);
            return onSubmit(event);
        }

        // Prefill input with selected command
        setValue(`/${suggestions[index].command} `);
        event.type === "click" && focusInput();
    };
    const suggestions = useChatSuggestions({
        items: commandList, // TODO filter commandList from user.roles (get from presence.meta)
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
