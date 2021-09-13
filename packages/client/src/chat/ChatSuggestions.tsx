import { Box, BoxProps, Stack } from "@chakra-ui/react";
import { callAll, on } from "@pastable/core";
import { MutableRefObject, ReactNode, useContext, useEffect, useMemo } from "react";

import { SmallText } from "@/components/Text";
import { UseVerticalNavProps, useVerticalNav } from "@/hooks/useVerticalNav";

import { ChatSuggestionsContext } from "./ChatSuggestionsProvider";

export type UseChatSuggestionsFilterFnProps<T = any> = { value: string; item: T; index: number; array: T[] };
export interface UseChatSuggestionsProps<T = any>
    extends Pick<
        UseVerticalNavProps,
        "activableSelector" | "onEnterKeyDown" | "onTabKeyDown" | "onKeyDownWithoutList"
    > {
    resultListRef: MutableRefObject<HTMLDivElement>;
    items: T[];
    filterFn: ({ value, item, index, array }: UseChatSuggestionsFilterFnProps<T>) => boolean;
}

export function useChatSuggestions<T = any>({
    items,
    filterFn,
    resultListRef,
    ...verticalNav
}: UseChatSuggestionsProps<T>) {
    const { value, closeSuggestions: closeSuggestionsProp, inputElement } = useContext(ChatSuggestionsContext);

    const suggestions = useMemo(() => {
        return items.filter((item, index, array) => filterFn({ value, item, index, array }));
    }, [value, items, filterFn]);
    const closeSuggestions = callAll(() => yNav.resetActive(), closeSuggestionsProp);

    const [_yIndex, yNav] = useVerticalNav({
        ...verticalNav,
        isOpen: true,
        containerRef: resultListRef,
        onEscapeKeyDown: closeSuggestions,
        initialIndex: 0,
    });

    useEffect(() => {
        if (!inputElement) return;
        return on(inputElement, "keydown", yNav.onKeyDown);
    }, [inputElement, yNav.onKeyDown]);

    // When items change, reset active & activable items
    useEffect(() => {
        if (!suggestions.length) return;

        yNav.resetActive();
        yNav.initActivableItems();
    }, [suggestions.length]);

    return suggestions;
}

interface ChatSuggestionsListProps<T = any> {
    suggestions: T[];
    renderItem: (item: T, index: number, array: T[]) => ReactNode;
    emptyLabel: string;
}

export function ChatSuggestionsList<T = any>({ suggestions, renderItem, emptyLabel }: ChatSuggestionsListProps<T>) {
    return (
        <Stack py="4" border="1px solid" rounded="lg" bg="gray.700" userSelect="none">
            {suggestions.length ? suggestions.map(renderItem) : <SmallText px="4">{emptyLabel}</SmallText>}
        </Stack>
    );
}
export const ChatSuggestionListItem = (props: BoxProps) => (
    <Box
        as="span"
        px="4"
        className="suggestion"
        _selected={{ bgColor: "gray.600" }}
        _hover={{ bgColor: "gray.500" }}
        cursor="pointer"
        {...props}
    />
);
