import { getRoomState } from "@/helpers";
import { RoomHooks, SimpleRoom } from "@/types";
import { sendMsg } from "@/ws-helpers";
import { ObjectLiteral, omit } from "@pastable/core";

export interface LobbyState extends MapObject<{ votes: ObjectLiteral }> {}

export interface LobbyGameRoom extends SimpleRoom<LobbyState> {}

export interface LobbyHooks extends RoomHooks<LobbyGameRoom> {}

export const lobbyHooks: LobbyHooks = {
    "rooms.leave": ({ ws, room }) => {
        // on user leave remove his vote if he has one

        if (!room.state.has("votes")) return;

        const votes = room.state.get("votes");
        room.state.set("votes", omit(votes, [ws.id]));

        const newState = getRoomState(room);
        room.clients.forEach((client) => sendMsg(client, ["rooms/update#" + room.name, newState]));
    },
};

interface MapObject<Props extends { [key: string]: unknown }> extends Map<keyof Props, Props[keyof Props]> {
    get<K extends keyof Props>(key: K): Props[K];
    // ... rest of the methods ...
}
