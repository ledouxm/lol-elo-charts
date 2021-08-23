import { Stack, Tag, TagLabel } from "@chakra-ui/react";
import { WithChildren } from "@pastable/core";
import { ChatType } from "./ChatMessage";

export const ChatFilterList = (props: { active: any; onClick: (type: ChatType) => void }) => {
    return (
        <Stack direction="row" alignSelf="flex-end">
            <ChatFilterTag key={"All"} {...props}>
                All
            </ChatFilterTag>
            {Object.keys(tagLabelByType).map((type: ChatType) => (
                <ChatFilterTag key={type} chatType={type} {...props}>
                    {tagLabelByType[type]}
                </ChatFilterTag>
            ))}
        </Stack>
    );
};

const tagLabelByType: Partial<Record<ChatType, string>> = {
    [ChatType.Lobby]: "Lobby",
    [ChatType.Whisper]: "DMs",
    [ChatType.Log]: "Logs",
    // [ChatType.Command]: "CMDs",
};

interface ChatFilterTagProps extends WithChildren {
    onClick: (type: ChatType) => void;
    active: ChatType;
    chatType?: ChatType;
}
const ChatFilterTag = ({ children, onClick, chatType, active }: ChatFilterTagProps) => {
    const isActive = chatType === active;

    return (
        <Tag
            size={"md"}
            borderRadius="full"
            variant="solid"
            colorScheme={isActive ? "cyan" : "blue"}
            userSelect="none"
            cursor="pointer"
            onClick={() => onClick(chatType)}
        >
            <TagLabel>{children}</TagLabel>
        </Tag>
    );
};
