import { ObjectLiteral } from "@pastable/core";

export interface Player {
    id: string;
    username: string;
    color: string;
    cursor?: { x: number; y: number };
}

export interface BaseRoom<Client extends { id: string }, State = ObjectLiteral> {
    name: string;
    clients: Array<Client>;
    state: State;
}
export interface Room extends BaseRoom<Player> {}

export interface RoomPlayer extends Pick<Player, "id"> {
    state: ObjectLiteral;
}

export interface AvailableRoom {
    name: string;
    clients: Array<Pick<Player, "id">>;
}
