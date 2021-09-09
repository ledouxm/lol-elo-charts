import { Box, Flex, Skeleton, Square } from "@chakra-ui/react";

import { MiniText, TinyText } from "@/components/Text";
import { ChatMessageData } from "./types";
import { useMyPresence } from "@/socket/usePresence";
import { isUser } from "@/functions/utils";

export interface ChatMessageProps extends ChatMessageData {
    onUsernameClick: (username: string) => void;
}
export const ChatMessage = ({ msg, from, to, self, type, confirmed, onUsernameClick }: ChatMessageProps) => {
    const me = useMyPresence();
    // timestamp on hover ? client-side

    const makeOnClick = (username: string) => ({ cursor: "pointer", onClick: () => onUsernameClick(username) });
    const memberProps = from && from.id !== me.id && isUser(from.id) ? makeOnClick(from.username) : {};

    const isWhisper = type === ChatType.Whisper;
    const isSentWhisper = isWhisper && self;

    const opacity = !self ? ([ChatType.Lobby, ChatType.Whisper].includes(type) ? 1 : 0.6) : confirmed ? 1 : 0.6;

    return (
        <Flex padding="0px 10px" bgColor={type === ChatType.Whisper && "yellow.600"} opacity={opacity}>
            <MiniText w="80%">
                {isWhisper ? (
                    <>
                        {isSentWhisper ? (
                            <>
                                <Box as="span" fontWeight="bold">
                                    {from.username}
                                </Box>
                                <Box as="span" mx="1">
                                    {">"}
                                </Box>
                                <Box as="span" mr="2" fontStyle="italic" {...makeOnClick(to)}>
                                    {to}
                                </Box>
                            </>
                        ) : (
                            <>
                                <Box as="span" fontWeight="bold">
                                    {me.username}
                                </Box>
                                <Box as="span" mx="1">
                                    {"<"}
                                </Box>
                                <Box as="span" mr="2" fontStyle="italic" {...makeOnClick(from.username)}>
                                    {from.username}
                                </Box>
                            </>
                        )}
                    </>
                ) : (
                    from && (
                        <Box as="span" mr="2" fontWeight="bold" {...memberProps}>
                            {from.username}
                        </Box>
                    )
                )}
                {!from && type && type !== ChatType.Log && (
                    <Box as="span" mr="1" fontWeight="bold">
                        [{chatTypePrefixes[type]}]
                    </Box>
                )}
                <Box as="span" fontStyle={type === ChatType.Log && "italic"}>
                    {msg}
                </Box>
            </MiniText>
        </Flex>
    );
};

const chatTypePrefixes: Record<ChatType, string> = { command: "CMD", whisper: "DM", log: "LOG", lobby: "L" };

export const ChatMessageSkeleton = () => {
    return (
        <Flex align="flex-end" padding="0px 10px">
            <Skeleton mx="15px" mt="5px">
                <Square width="15px" height="20px" />
            </Skeleton>
            <Skeleton w="80%">
                <TinyText>_</TinyText>
            </Skeleton>
        </Flex>
    );
};

export enum ChatType {
    Lobby = "lobby",
    Whisper = "whisper",
    Command = "command",
    Log = "log",
}
