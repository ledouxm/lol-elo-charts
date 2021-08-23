import { usePrevious } from "@chakra-ui/react";
import { KeyboardEventHandler, MutableRefObject, useCallback, useEffect, useState } from "react";

import { useArrayCursor } from "./useArrayCursor";

export type UseVerticalNavProps = {
    isOpen: boolean;
    containerRef: MutableRefObject<HTMLElement>;
    activableSelector: string;
    onEscapeKeyDown?: KeyboardEventHandler;
    onKeyDownWithoutList?: KeyboardEventHandler;
    onEnterKeyDown?: (activeIndex: number, event: unknown) => boolean | void;
    onTabKeyDown?: (activeIndex: number, event: unknown) => void;
    // UseArrayCursor args
    initialIndex?: number;
    shouldLoop?: boolean;
};

export function useVerticalNav({
    isOpen,
    containerRef,
    activableSelector,
    onEscapeKeyDown,
    onEnterKeyDown,
    onTabKeyDown,
    onKeyDownWithoutList,
    initialIndex,
    shouldLoop,
}: UseVerticalNavProps) {
    const [activableItems, setActivableItems] = useState<HTMLElement[]>([]);
    const initActivableItems = useCallback(() => {
        if (isOpen && containerRef.current) {
            const items = Array.from(containerRef.current.querySelectorAll(activableSelector));
            items.forEach(setTabIndex(0));
            setActivableItems(items as HTMLElement[]);
        } else {
            setActivableItems([]);
        }
    }, [isOpen]);

    const [activeIndex, cursorActions] = useArrayCursor(activableItems.length, initialIndex, shouldLoop);
    const prevActiveIndex = usePrevious(activeIndex);

    const resetActive = () => {
        if (prevActiveIndex > -1 && activableItems[prevActiveIndex]) {
            activableItems[prevActiveIndex].setAttribute("aria-selected", "false");
        }
        cursorActions.reset();
    };

    // When list is shown, init activableItems & their tabIndex
    useEffect(initActivableItems, [isOpen]);

    // Update index & change/reset active item
    useEffect(() => {
        // When an element is active
        if (activeIndex !== -1 && activableItems[activeIndex]) {
            // Unselect previous
            if (prevActiveIndex > -1 && activableItems[prevActiveIndex]) {
                activableItems[prevActiveIndex].setAttribute("aria-selected", "false");
            }

            activableItems[activeIndex].setAttribute("aria-selected", "true");
            activableItems[activeIndex].scrollIntoView({
                behavior: "smooth",
                block: "end",
                inline: "nearest",
            });
        }
    }, [activableItems, prevActiveIndex, activeIndex]);

    const onKeyDown: KeyboardEventHandler = (event) => {
        if (!isOpen) return;

        if (event.key === "Escape" && onEscapeKeyDown) {
            return onEscapeKeyDown(event);
        } else if (event.key === "Enter" && onEnterKeyDown) {
            const shouldNotPreventDefault = onEnterKeyDown(activeIndex, event);
            // Prevent form submission on enter, unless returned true in callback
            !shouldNotPreventDefault && event.preventDefault();
        } else if (event.key === "Tab" && onTabKeyDown) {
            // Prevent tabbing to another element
            event.preventDefault();
            return onEnterKeyDown(activeIndex, event);
        }

        // When there is no items
        if (!activableItems.length) {
            onKeyDownWithoutList?.(event);
            return;
        }

        // Event requiring items
        if (event.key === "ArrowDown") {
            event.preventDefault();
            cursorActions.next();
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            cursorActions.prev();
        }
    };

    const activeElement = activableItems[activeIndex];
    return [activeIndex, { activeElement, resetActive, initActivableItems, onKeyDown }] as const;
}

const setTabIndex = (tabIndex: number) => (node: HTMLElement) => node.setAttribute("tabindex", tabIndex + "");
