import { SelectionActions } from "@pastable/core";

import { isUser } from "@/functions/utils";
import { LobbyRoomInterface } from "@/room/LobbyRoom";
import { useSocketEmit } from "@/socket/useSocketConnection";
import { Player } from "@/types";

import { ChatCommandName, commandListMap } from "./ChatCommand";
import { ChatType } from "./ChatMessage";
import { ChatMessageData } from "./types";

export function interpretChatCommand({
    id,
    msg,
    emit,
    player,
    lobby,
    usernames,
    messages,
    actions,
}: InterpretChatCommandProps) {
    const [command, ...parts] = msg.split(" ");
    if (!commandListMap[command as ChatCommandName]) return ChatInterpretCommandError.UnknownCommand;

    if (command === ChatCommandName.Whisper) {
        const [toUsername, message] = [parts[0], parts.slice(1).join(" ")];

        if (!message) return ChatInterpretCommandError.NoMessage;
        if (!usernames.includes(toUsername)) return ChatInterpretCommandError.NotInLobby;
        if (!isUser(player.id)) return ChatInterpretCommandError.NeedsToBeUserToInitiateWhisper;

        const toPlayer = lobby.clients.find((client) => client.username === toUsername);
        if (!toPlayer) return ChatInterpretCommandError.NotInLobby;

        // TODO ?
        // Directly pass toId if found to avoid searching for the participant from its username server-side
        // const to = toId ? { toId } : { toUsername };
        const msgData = {
            id,
            msg: message,
            from: player,
            self: true,
            confirmed: false,
            type: ChatType.Whisper,
            to: toUsername,
        };

        actions.add(msgData);
        emit("dm#" + toPlayer.id, [
            `rooms.msg#` + lobby.name,
            { id, msg: message, from: player, type: ChatType.Whisper },
        ]);
        return;
    }

    if (command === ChatCommandName.Reply) {
        const message = parts.join(" ");
        if (!message) return ChatInterpretCommandError.NoMessage;

        const lastReceivedWhisper = messages.find((chat) => chat.type === ChatType.Whisper && !chat.self);
        if (!lastReceivedWhisper) return ChatInterpretCommandError.NoWhisperReceived;

        const toUsername = lastReceivedWhisper.from.username;

        // Directly pass toId if found to avoid searching for the participant from its username server-side
        // const to = toId ? { toId } : { toUsername };
        // const to = { toUsername };
        const toId = lastReceivedWhisper.from.id;
        const msgData = {
            id,
            msg: message,
            from: player,
            self: true,
            confirmed: false,
            type: ChatType.Whisper,
            to: toUsername,
        };

        actions.add(msgData);
        emit("dm#" + toId, [`rooms.msg#` + lobby.name, { id, msg: message, from: player, type: ChatType.Whisper }]);
        return;
    }

    if (command === ChatCommandName.List) {
        const message = "Current participants : " + lobby.clients.map((participant) => participant.username).join(", ");
        actions.add({ id, msg: message, type: ChatType.Command });
        return;
    }

    // TODO Set current admin instead if self is admin
    if (command === ChatCommandName.Admin) {
        const message =
            "Current admin is : " + lobby.clients.find((participant) => participant.id === lobby.state.admin)?.username;
        actions.add({ id, msg: message, type: ChatType.Command });
        return;
    }
}

enum ChatInterpretCommandError {
    UnknownCommand = "Unknown command.",
    NoMessage = "Nothing to send.",
    NotInLobby = "You need to be in the same lobby to DM someone !",
    NeedsToBeUserToInitiateWhisper = "Only registered users can initiate a private conversation.",
    NoWhisperReceived = "No one to reply to... how sad :(",
}

type InterpretChatCommandProps = Pick<ChatMessageData, "id" | "msg"> & {
    emit: ReturnType<typeof useSocketEmit>;
    player: Player;
    lobby: LobbyRoomInterface;
    usernames: string[];
    messages: ChatMessageData[];
    actions: SelectionActions<ChatMessageData>;
};
