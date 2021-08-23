import { Stack } from "@chakra-ui/react";

import { SmallText, TinyText } from "@/components/Text";
import { ChatSuggestionListItem } from "./ChatSuggestions";
import { WithChildren, WithOnClick } from "@pastable/core";

export enum ChatCommandName {
    Whisper = "w",
    Reply = "r",
    List = "list",
    Admin = "admin",
    Vote = "vote",
    Kick = "kick",
}

export const commandList: ChatCommandData[] = [
    {
        command: ChatCommandName.Whisper,
        param: "username",
        secondParam: "msg",
        description: "Whisper to another participant using its username.",
    },
    {
        command: ChatCommandName.Reply,
        description: "Reply to the last participant that sent you a whisper.",
        param: "msg",
    },
    { command: ChatCommandName.List, description: "List current lobby participants." },
    { command: ChatCommandName.Kick, param: "username", description: "Kick participant from lobby." },
    {
        command: ChatCommandName.Admin,
        param: "username?",
        description: "Give admin rights to a participant from its username.",
    },
    { command: ChatCommandName.Vote, param: "game", description: "Vote to play said game." },
];
export const commandListMap: Record<ChatCommandData["command"], ChatCommandData> = commandList.reduce(
    (map, item) => ({ ...map, [item.command]: item }),
    {} as any
);

type ChatCommandProps = WithChildren & Pick<ChatCommandData, "command" | "param" | "secondParam"> & WithOnClick;
export const ChatCommand = ({ children, command, param, secondParam, onClick }: ChatCommandProps) => {
    return (
        <ChatSuggestionListItem onClick={onClick}>
            <Stack direction="row">
                <SmallText fontWeight="bold">/{command}</SmallText>
                {param && <SmallText>[{param}]</SmallText>}
                {secondParam && <SmallText>[{secondParam}]</SmallText>}
            </Stack>
            <TinyText>{children}</TinyText>
        </ChatSuggestionListItem>
    );
};

export interface ChatCommandData {
    command: ChatCommandName;
    param?: string;
    secondParam?: string;
    description?: string;
}
