import { getRoomState } from "@/helpers";
import { GameRoom, MapObject, RoomHooks, SimpleRoom } from "@/types";
import { getMostOcurrence } from "@/utils";
import { sendMsg } from "@/ws-helpers";
import { omit, pickOne } from "@pastable/core";

export interface LobbyState
    extends MapObject<{
        admin: string;
        votes: Record<string, string>;
        mode: "democracy" | "anarchy" | "monarchy";
        selectedGame: string;
        gameRoom: GameRoom["name"];
    }> {}
export interface LobbyGameRoom extends SimpleRoom<LobbyState> {}
export interface LobbyHooks extends RoomHooks<LobbyGameRoom> {}

export const lobbyHooks: LobbyHooks = {
    "rooms.create": ({ ws, room }) => {
        ws.roles.add(`rooms.${room.name}.admin`);
        room.state.set("mode", "democracy");
    },
    "rooms.join": ({ ws, room }) => {
        if (ws.roles.has(`rooms.${room.name}.admin`)) return;

        // Allow anyone joining to vote
        ws.roles.add(`rooms.${room.name}.set#votes.${ws.id}`);
    },
    "rooms.before.update": ({ ws, room, field }, update) => {
        // Check permissions before updating room.state
        const isAdmin = ws.roles.has("global.admin") || ws.roles.has(`rooms.${room.name}.admin`);
        if (isAdmin) return true;

        if (field) {
            return ws.roles.has(`rooms.${room.name}.set#${field}`);
        }

        return false;
    },
    "rooms.update": ({ room, field, broadcastEvent }, _update) => {
        if (field.includes("votes.")) {
            const mode = room.state.get("mode");
            const possibleGames = Object.values(room.state.get("votes"));

            if (mode === "democracy") {
                room.state.set("selectedGame", getMostOcurrence(possibleGames));
            } else if (mode === "anarchy") {
                room.state.set("selectedGame", pickOne(possibleGames));
            } else {
                room.state.set(
                    "selectedGame",
                    room.state.get("votes")[room.state.get("admin")] || pickOne(possibleGames)
                );
            }

            broadcastEvent(room, "rooms.update#" + room.name, { selectedGame: room.state.get("selectedGame") });
        }
    },
    "rooms.leave": ({ ws, room }) => {
        // Pass admin role to a random room.client
        if (ws.roles.has(`rooms.${room.name}.admin`)) {
            const client = pickOne(Array.from(room.clients));
            if (client) {
                client.roles.add(`rooms.${room.name}.admin`);
                room.state.set("admin", client.id);
            }
        }
        if (!room.clients.size) return;

        // on user leave remove his vote if he has one
        if (!room.state.has("votes")) return;

        const votes = room.state.get("votes");
        room.state.set("votes", omit(votes, [ws.id]));

        const newState = getRoomState(room);
        room.clients.forEach((client) => sendMsg(client, ["rooms/update#" + room.name, newState]));
    },
};
