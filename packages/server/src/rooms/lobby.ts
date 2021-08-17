import { getRoomState } from "@/helpers";
import { MapObject, RoomHooks, SimpleRoom } from "@/types";
import { sendMsg } from "@/ws-helpers";
import { ObjectLiteral, omit, pickOne } from "@pastable/core";

export interface LobbyState extends MapObject<{ votes: ObjectLiteral }> {}
export interface LobbyGameRoom extends SimpleRoom<LobbyState> {}
export interface LobbyHooks extends RoomHooks<LobbyGameRoom> {}

export const lobbyHooks: LobbyHooks = {
    "rooms.create": ({ ws, room }) => {
        ws.roles.add(`rooms.${room.name}.admin`);
    },
    "rooms.join": ({ ws, room }) => {
        if (ws.roles.has(`rooms.${room.name}.admin`)) return;

        // Allow anyone joining to vote
        ws.roles.add(`rooms.${room.name}.set#votes.${ws.id}`);
    },
    "rooms.before.update": ({ ws, room, field }, update) => {
        // Check permissions before updating room.state
        const isAdmin = ws.roles.has("admin") || ws.roles.has(`rooms.${room.name}.admin`);
        if (isAdmin) return true;

        if (field) {
            return ws.roles.has(`rooms.${room.name}.set#${field}`);
        }

        // TODO filtrer/modifier l'objet update sur que les champ où on a la permission ?
        return false;
    },
    "rooms.update": ({ ws, room }, update) => {
        // TODO
        // démocratie/anarchie/monarchie
        // démocratie = votes
        // anarchies = vote + ça prend un jeu au pif parmi
        // monarchie un mec choisi = selectedGame
    },
    "rooms.leave": ({ ws, room }) => {
        // Pass admin role to a random room.client
        if (ws.roles.has(`rooms.${room.name}.admin`)) {
            pickOne(Array.from(room.clients))?.roles.add(`rooms.${room.name}.admin`);
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
