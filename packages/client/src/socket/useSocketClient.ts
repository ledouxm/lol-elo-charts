import { ObjectLiteral } from "@pastable/core";

import { useSocketEmit, useSocketEventEmitter, useSocketStatus } from "@/socket/useSocketConnection";
import { Player, Room } from "@/types";

import { usePresenceIsSynced } from "./usePresence";

export const useSocketClient = (): SocketClient => {
    const emit = useSocketEmit();
    const emitter = useSocketEventEmitter();
    const once = emitter.once.bind(emitter);

    const status = useSocketStatus();
    const isSynced = usePresenceIsSynced();

    return { emit, once, status, isSynced, ...makeSocketClient(emit) };
};

const makeSocketClient = (emit: ReturnType<typeof useSocketEmit>) => {
    const global: GlobalClient = {
        relay: (msg) => emit("relay", msg),
        broadcast: (msg) => emit("broadcast", msg),
        dm: (userId, msg) => emit("dm#" + userId, msg),
    };

    const presence: PresenceClient = {
        sub: (topic) => emit("sub#" + topic),
        unsub: (topic) => emit("unsub#" + topic),
        list: () => emit("presence.list"),
        update: (state) => emit("presence.update", state),
        updateMeta: (meta) => emit("presence.update#meta", meta),
        get: (userId) => emit("presence.get#" + userId),
        getMeta: (userId) => emit("presence.get:meta#" + userId),
    };

    const rooms: RoomClient = {
        list: () => emit("rooms.list"),
        sub: () => emit("sub#rooms"),
        unsub: () => emit("unsub#rooms"),
        get: (name) => emit("rooms.get#" + name),
        join: (name) => emit("rooms.join#" + name),
        watch: (name) => emit("rooms.watch#" + name),
        unwatch: (name) => emit("rooms.unwatch#" + name),
        create: (name, { initialState, type } = {}) =>
            emit(`rooms.create${type ? ":" + type : ""}#` + name, initialState),
        update: (name, update, field) => emit(`rooms.update${field ? ":" + field : ""}#` + name, update),
        kick: (name, id) => emit("rooms.kick#" + name, id),
        leave: (name) => emit("rooms.leave#" + name),
        delete: (name) => emit("rooms.delete#" + name),
        relay: (name, msg) => emit("rooms.relay#" + name, msg),
        broadcast: (name, msg) => emit("rooms.broadcast#" + name, msg),
        any: (name, event, msg) => emit(`rooms.any.${event}#` + name, msg),
        addRole: (name, userId, roleName) => emit(`roles.add#` + userId, `rooms.${name}.${roleName}`),
        deleteRole: (name, userId, roleName) => emit(`roles.delete#` + userId, `rooms.${name}.${roleName}`),
    };

    const games: GameRoomClient = {
        list: () => emit("games.list"),
        sub: () => emit("sub#games"),
        unsub: () => emit("unsub#games"),
        get: (name) => emit("games.get#" + name),
        join: (name) => emit("games.join#" + name),
        create: (name, gameId, initialState) => emit(`games.create:${gameId}#` + name, initialState),
        update: (name, update, field) => emit(`games.update:${field ? ":" + field : ""}#` + name, update),
        getMeta: (name, fields) => emit(`games.get.meta:${fields.join(",")}#` + name),
        updateMeta: (name, update, field) => emit(`games.update.meta:${field}#` + name, update),
        kick: (name, id) => emit("games.kick#" + name, id),
        leave: (name) => emit("games.leave#" + name),
        delete: (name) => emit("games.delete#" + name),
        relay: (name, msg: any) => emit("games.relay#" + name, msg),
        broadcast: (name, msg: any) => emit("games.broadcast#" + name, msg),
        any: (name, event, msg) => emit(`games.any.${event}#` + name, msg),
        addRole: (name, userId, roleName) => emit(`roles.add#` + userId, `games.${name}.${roleName}`),
        deleteRole: (name, userId, roleName) => emit(`roles.delete#` + userId, `games.${name}.${roleName}`),
    };

    const roles: RoleClient = {
        get: (userId?) => emit("roles.get" + (userId ? "#" + userId : "")),
        add: (userId, roles) => emit(`roles.add#` + userId, roles),
        delete: (userId, roles) => emit(`roles.delete#` + userId, roles),
    };

    return { global, presence, rooms, games, roles };
};

export const makeSpecificRoomClient = (client: RoomClient, name: Room["name"]) => ({
    ...client,
    get: () => client.get.apply(null, [name]) as void,
    join: () => client.join.apply(null, [name]) as void,
    watch: () => client.watch.apply(null, [name]) as void,
    unwatch: () => client.unwatch.apply(null, [name]) as void,
    create: (initialData: { initialState?: ObjectLiteral; type?: string }) =>
        client.create.apply(null, [name, initialData]) as void,
    update: <Field extends string = undefined>(update: Field extends undefined ? ObjectLiteral : any, field?: Field) =>
        client.update.apply(null, [name, update, field]),
    leave: () => client.leave.apply(null, [name]) as void,
    kick: (id: Player["id"]) => client.kick.apply(null, [name, id]) as void,
    delete: () => client.delete.apply(null, [name]) as void,
    relay: (msg: any) => client.relay.apply(null, [name, msg]) as void,
    broadcast: (msg: any) => client.broadcast.apply(null, [name, msg]) as void,
    any: () => client.any.apply(null, [name]) as void,
    addRole: (userId: Player["id"], roleName: string) =>
        client.addRole.apply(null, [name, userId, `rooms.${name}.${roleName}`]) as void,
    deleteRole: (userId: Player["id"], roleName: string) =>
        client.deleteRole.apply(null, [name, userId, `rooms.${name}.${roleName}`]) as void,
});

export const makeSpecificGameRoomClient = (client: GameRoomClient, name: Room["name"]) => ({
    ...makeSpecificRoomClient(client as any, name),
    create: (gameId: string, initialData: { initialState?: ObjectLiteral; type?: string }) =>
        client.create.apply(null, [gameId, initialData]) as void,
    getMeta: (update: ObjectLiteral, fields?: Array<string>) =>
        client.getMeta.apply(null, [name, update, fields]) as void,
    updateMeta: (update: ObjectLiteral, field?: string) => client.updateMeta.apply(null, [name, update, field]) as void,
    addRole: (userId: Player["id"], roleName: string) =>
        client.addRole.apply(null, [name, userId, `games.${name}.${roleName}`]) as void,
    deleteRole: (userId: Player["id"], roleName: string) =>
        client.deleteRole.apply(null, [name, userId, `games.${name}.${roleName}`]) as void,
});

export interface SocketClient {
    emit: ReturnType<typeof useSocketEmit>;
    once: ReturnType<typeof useSocketEventEmitter>["once"];
    status: string;
    isSynced: boolean;
    presence: PresenceClient;
    rooms: RoomClient;
    games: GameRoomClient;
    roles: RoleClient;
    global: GlobalClient;
}
interface GlobalClient {
    relay: (msg: any) => void;
    broadcast: (msg: any) => void;
    dm: (userId: Player["id"], msg: any) => void;
}
interface PresenceClient {
    sub: (topic: string) => void;
    unsub: (topic: string) => void;
    list: () => void;
    update: (state: Partial<Player>) => void;
    updateMeta: (meta: ObjectLiteral) => void;
    get: (userId: Player["id"]) => void;
    getMeta: (userId: Player["id"]) => void;
}

interface RoomClient {
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
    any: (name: Room["name"], event: string, msg: any) => void;
    addRole: (name: Room["name"], userId: Player["id"], roles: string | Array<string>) => void;
    deleteRole: (name: Room["name"], userId: Player["id"], roles: string | Array<string>) => void;
}
interface GameRoomClient extends Omit<RoomClient, "create" | "watch" | "unwatch"> {
    getMeta: (name: Room["name"], fields?: Array<string>) => void;
    updateMeta: (name: Room["name"], update: ObjectLiteral, field?: string) => void;
    create: (name: Room["name"], gameId: string, initialState?: ObjectLiteral) => void;
}

interface RoleClient {
    get: (userId?: Player["id"]) => void;
    add: (userId: Player["id"], roles: string | Array<string>) => void;
    delete: (userId: Player["id"], roles: string | Array<string>) => void;
}
