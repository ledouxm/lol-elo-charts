import { Box } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BsArrowDown } from "react-icons/bs";
import { useVirtual } from "react-virtual";

import { IconAction } from "@/components/IconAction";
import { ChatMessage, ChatMessageProps, ChatMessageSkeleton } from "./ChatMessage";
import { ChatMessageData } from "./types";
import { last } from "@pastable/core";

interface ChatListProps extends Pick<ChatMessageProps, "onUsernameClick"> {
    messages: ChatMessageData[];
    isLoading: boolean;
}

export function ChatList({ messages, isLoading, onUsernameClick }: ChatListProps) {
    const [atBottom, setAtBottom] = useState(false);

    const showButtonTimeoutRef = useRef(null);
    const [showButton, setShowButton] = useState(false);
    const scrollToBottom = () => rowVirtualizer.scrollToIndex(messages.length - 1);

    // Show/hide scroll to bottom btn after 500ms passed when chat is NOT fully scrolled
    useEffect(() => {
        clearTimeout(showButtonTimeoutRef.current);
        if (!atBottom && messages.length) {
            showButtonTimeoutRef.current = setTimeout(() => setShowButton(true), 500);
        } else {
            setShowButton(false);
        }

        return () => {
            clearTimeout(showButtonTimeoutRef.current);
        };
    }, [atBottom, setShowButton]);

    const parentRef = useRef(null as HTMLDivElement);
    const rowVirtualizer = useVirtual({
        size: isLoading ? 10 : messages.length,
        parentRef,
        estimateSize: useCallback(() => 35, []),
        overscan: 5,
    });

    const lastMessageIdRef = useRef(null as ChatMessageData["id"]);
    // Detect when chat is fully scrolled & Auto scroll on new messages
    useEffect(() => {
        const lastItem = last(rowVirtualizer.virtualItems);
        if (!lastItem) return;

        if (lastItem.index === messages.length - 1) {
            setAtBottom(true);

            const lastMsgId = messages[lastItem.index].id;
            if (lastMsgId !== lastMessageIdRef.current) {
                lastMessageIdRef.current = lastMsgId;
                scrollToBottom();
            }
        } else {
            setAtBottom(false);
        }
    }, [messages.length, rowVirtualizer.virtualItems]);

    return (
        <Box position="relative" h="100%">
            <Box ref={parentRef} position="relative" h="100%" maxH="300px" overflow="auto">
                <div
                    className="ListInner"
                    style={{
                        height: `${rowVirtualizer.totalSize}px`,
                        width: "100%",
                        position: "relative",
                    }}
                >
                    {rowVirtualizer.virtualItems.map((virtualRow) => (
                        <div
                            key={virtualRow.index}
                            className={virtualRow.index % 2 ? "ListItemOdd" : "ListItemEven"}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            <Box pt={["0.55rem", null, "0.65rem", null, "0.75rem"]}>
                                {isLoading ? (
                                    <ChatMessageSkeleton key={virtualRow.index} />
                                ) : (
                                    <ChatMessage
                                        key={messages[virtualRow.index].msg}
                                        onUsernameClick={onUsernameClick}
                                        {...messages[virtualRow.index]}
                                    />
                                )}
                            </Box>
                        </div>
                    ))}
                </div>
            </Box>
            {showButton && (
                <Box position="absolute" bottom="0" right="20px">
                    <IconAction boxSize="30px" icon={BsArrowDown} label="Scroll to bottom" onClick={scrollToBottom} />
                </Box>
            )}
        </Box>
    );
}
