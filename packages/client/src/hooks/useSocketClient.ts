import { useSocketEmit, useSocketEventEmitter, useSocketStatus } from "@/hooks/useSocketConnection";
import { Player, Room } from "@/types";
import { ObjectLiteral } from "@pastable/core";
import { usePresenceIsSynced } from "./usePresence";

export const useSocketClient = (): SocketClient => {
    const emit = useSocketEmit();
    const emitter = useSocketEventEmitter();
    const once = emitter.once.bind(emitter);

    const status = useSocketStatus();
    const isSynced = usePresenceIsSynced();

    const relay = (msg: any) => emit("relay", msg);
    const broadcast = (msg: any) => emit("broadcast", msg);

    const presence = {
        sub: (topic: string) => emit("sub#" + topic),
        unsub: (topic: string) => emit("unsub#" + topic),
        list: () => emit("presence.list"),
        update: (state: Partial<Player>) => emit("presence.update", state),
        updateMeta: (meta: ObjectLiteral) => emit("presence.update#meta", meta),
        get: (userId: Player["id"]) => emit("presence.get#" + userId),
        getMeta: (userId: Player["id"]) => emit("presence.get:meta#" + userId),
    };

    const rooms = {
        list: () => emit("rooms.list"),
        sub: () => emit("sub#rooms"),
        unsub: () => emit("unsub#rooms"),
        get: (name: Room["name"]) => emit("rooms.get#" + name),
        join: (name: Room["name"]) => emit("rooms.join#" + name),
        watch: (name: Room["name"]) => emit("rooms.watch#" + name),
        unwatch: (name: Room["name"]) => emit("rooms.unwatch#" + name),
        create: (name: Room["name"], { initialState, type }: { initialState?: ObjectLiteral; type?: string } = {}) =>
            emit(`rooms.create${type ? ":" + type : ""}#` + name, initialState),
        update: (name: Room["name"], update: ObjectLiteral, field?: string) =>
            emit(`rooms.update${field ? ":" + field : ""}#` + name, update),
        kick: (name: Room["name"], id: Player["id"]) => emit("rooms.kick#" + name, id),
        leave: (name: Room["name"]) => emit("rooms.leave#" + name),
        delete: (name: Room["name"]) => emit("rooms.delete#" + name),
        relay: (name: Room["name"], msg: any) => emit("rooms.relay#" + name, msg),
        broadcast: (name: Room["name"], msg: any) => emit("rooms.broadcast#" + name, msg),
    };

    const games: GameRoomClient = {
        list: () => emit("games.list"),
        sub: () => emit("sub#games"),
        unsub: () => emit("unsub#games"),
        get: (name: Room["name"]) => emit("games.get#" + name),
        join: (name: Room["name"]) => emit("games.join#" + name),
        create: (name: Room["name"], gameId: string, initialState?: ObjectLiteral) =>
            emit(`games.create:${gameId}#` + name, initialState),
        update: (name: Room["name"], update: ObjectLiteral, field?: string) =>
            emit(`games.update:${field ? ":" + field : ""}#` + name, update),
        getMeta: (name: Room["name"], fields?: Array<string>) => emit(`games.get.meta:${fields.join(",")}#` + name),
        updateMeta: (name: Room["name"], update: ObjectLiteral, field?: string) =>
            emit(`games.update.meta:${field}#` + name, update),
        kick: (name: Room["name"], id: Player["id"]) => emit("games.kick#" + name, id),
        leave: (name: Room["name"]) => emit("games.leave#" + name),
        delete: (name: Room["name"]) => emit("games.delete#" + name),
        relay: (name: Room["name"], msg: any) => emit("games.relay#" + name, msg),
        broadcast: (name: Room["name"], msg: any) => emit("games.broadcast#" + name, msg),
    };

    const roles = {
        get: (userId?: Player["id"]) => emit("roles.get" + (userId ? "#" + userId : "")),
        add: (userId: Player["id"], roles: Array<string>) => emit(`roles.add#` + userId, roles),
        delete: (userId: Player["id"], roles: Array<string>) => emit(`roles.delete#` + userId, roles),
    };

    return { emit, once, status, isSynced, presence, rooms, games, roles, relay, broadcast };
};

export interface SocketClient {
    emit: ReturnType<typeof useSocketEmit>;
    once: ReturnType<typeof useSocketEventEmitter>["once"];
    status: string;
    isSynced: boolean;
    presence: PresenceClient;
    rooms: RoomClient;
    games: GameRoomClient;
    roles: RoleClient;
    relay: (msg: any) => void;
    broadcast: (msg: any) => void;
}
export interface PresenceClient {
    sub: (topic: string) => void;
    unsub: (topic: string) => void;
    list: () => void;
    update: (state: Partial<Player>) => void;
    updateMeta: (meta: ObjectLiteral) => void;
    get: (userId: Player["id"]) => void;
    getMeta: (userId: Player["id"]) => void;
}

export interface RoomClient {
    list: () => void;
    sub: () => void;
    unsub: () => void;
    get: (name: Room["name"]) => void;
    join: (name: Room["name"]) => void;
    watch: (name: Room["name"]) => void;
    unwatch: (name: Room["name"]) => void;
    create: (name: Room["name"], initialData?: { initialState?: ObjectLiteral; type?: string }) => void;
    update: (name: Room["name"], update: ObjectLiteral, field?: string) => void;
    leave: (name: Room["name"]) => void;
    kick: (name: Room["name"], id: Player["id"]) => void;
    delete: (name: Room["name"]) => void;
    relay: (name: Room["name"], msg: any) => void;
    broadcast: (name: Room["name"], msg: any) => void;
}
export interface GameRoomClient extends Omit<RoomClient, "create" | "watch" | "unwatch"> {
    getMeta: (name: Room["name"], fields?: Array<string>) => void;
    updateMeta: (name: Room["name"], update: ObjectLiteral, field?: string) => void;
    create: (name: Room["name"], gameId: string) => void;
}

export interface RoleClient {
    get: (userId?: Player["id"]) => void;
    add: (userId: Player["id"], roles: Array<string>) => void;
    delete: (userId: Player["id"], roles: Array<string>) => void;
}
