import { Player } from "@/types";
import { ChatType } from "./ChatMessage";

interface ChatEventData {
    msg: string;
    id: string;
    toId?: Player["id"];
    toUsername?: Player["username"];
}

export type ChatWhisperPayload = Pick<ChatEventData, "msg" | "id" | "toId" | "toUsername">;
export type ChatReceivedPayload = {
    id: string;
    msg: string;
    from?: Player;
    type?: ChatType;
};

export interface ChatMessageData extends ChatReceivedPayload {
    /** Random string identifier generated client-side */
    id: string;
    /** Whispering to [username] (only present from self-msgs) */
    to?: string;
    /** Is it a message sent by self ? */
    self?: boolean;
    /** Was it received server-side ? */
    confirmed?: boolean;
}
