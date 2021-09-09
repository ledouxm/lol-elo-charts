import { IconAction } from "@/components/IconAction";
import { errorToast } from "@/functions/toasts";
import { makeId } from "@/functions/utils";
import { useMyPresence } from "@/socket/usePresence";
import { useSocketEmit, useSocketEvent } from "@/socket/useSocketConnection";
import { useRoomContext } from "@/room/LobbyRoom";
import { Flex, Stack } from "@chakra-ui/react";
import { useSelection } from "@pastable/core";
import { atom } from "jotai";
import { useAtomValue } from "jotai/utils";
import { useMemo, useRef, useState } from "react";
import { AiOutlineStop } from "react-icons/ai";
import { ChatFilterList } from "./ChatFilterList";
import { ChatForm, ChatFormValues } from "./ChatForm";
import { ChatList } from "./ChatList";
import { ChatType } from "./ChatMessage";
import { useLobbyUsernames } from "./ChatUsernameSuggestions";
import { interpretChatCommand } from "./interpretCommand";
import { ChatMessageData, ChatReceivedPayload } from "./types";

export const msgsRefAtom = atom({ current: [] as Array<ChatMessageData> });

export function Chat() {
    const emit = useSocketEmit();
    const me = useMyPresence();

    const lobby = useRoomContext();
    const usernames = useLobbyUsernames();

    const msgsRef = useAtomValue(msgsRefAtom);
    const [messages, actions] = useSelection<ChatMessageData>({
        initial: msgsRef.current,
        getId: (msg) => msg.id,
        onUpdate: (msgs: Array<ChatMessageData>) => (msgsRef.current = msgs || []),
    });
    const clear = () => actions.set([]);

    // Should return true if a message was sent, so we can clear the field
    const onSubmit = ({ msg }: ChatFormValues) => {
        if (!msg) return;

        const id = makeId();
        if (msg.startsWith("/")) {
            const error = interpretChatCommand({
                msg: msg.slice(1),
                id,
                emit,
                player: me,
                lobby,
                actions,
                usernames,
                messages,
            });

            if (error) {
                errorToast({ title: "Can't send message", description: error });
                return false;
            }

            return true;
        }

        actions.add({ id, msg, from: me, self: true, confirmed: false, type: ChatType.Lobby });
        emit("rooms.relay#" + lobby.name, [`rooms.msg#` + lobby.name, { id, msg, from: me }]);
        return true;
    };

    useSocketEvent<ChatReceivedPayload>("rooms.msg#" + lobby.name, ({ id, msg, from, type = ChatType.Lobby }) => {
        // Do not add msg sent by self, since they were optimistically added on submit
        if (from?.id === me.id) {
            // But instead confirm that they were properly sent
            return actions.set((messages) => {
                const index = messages.findIndex((chat) => chat.id === id);
                if (index === -1) return messages;

                messages[index] = { ...messages[index], confirmed: true };
                return [...messages];
            });
        }

        actions.add({ msg, from, type, id: makeId() });
    });
    useSocketEvent("dm/notFound", () => errorToast({ description: "User not found" }));
    useSocketEvent("dm/offline", () => errorToast({ description: "User is offline" }));

    // Pre-fill ChatInput with /w [username] on ChatList.ChatMessage.from.username click
    const usernameInputRef = useRef<HTMLInputElement>();
    const onUsernameClick = (username: string) => {
        const inputValue = usernameInputRef.current.value || "";
        if (inputValue.startsWith("/w ")) return;

        usernameInputRef.current.value = `/w ${username} ${inputValue}`;
        usernameInputRef.current.focus();
    };

    const [typeFilter, setTypeFilter] = useState(undefined);
    const filtered = useMemo(() => {
        return typeFilter ? messages.filter((msg) => msg.type === typeFilter) : messages;
    }, [messages, typeFilter]);
    const filterByType = (type: ChatType) => setTypeFilter(type);

    const tagProps = { active: typeFilter, onClick: filterByType };
    const chatFormProps = { onSubmit, usernameInputRef };

    return (
        <Stack h="100%">
            <Flex justifyContent="space-between" alignItems="center">
                <IconAction
                    icon={AiOutlineStop}
                    label="Clear chat messages"
                    onClick={clear}
                    isDisabled={!Boolean(messages.length)}
                />
                <ChatFilterList {...tagProps} />
            </Flex>
            <ChatList messages={filtered} isLoading={!lobby?.isSynced} onUsernameClick={onUsernameClick} />
            <ChatForm {...chatFormProps} />
        </Stack>
    );
}
