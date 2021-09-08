import WebSocket from "ws";
import { User, UserRole } from "./entities/User";

export type GlobalSubscription = "presence" | "rooms" | "games";

export interface WsUser {
    id: User["id"];
    user?: User;
    clients: Set<AppWebsocket>;
    rooms: Set<Room | GameRoom>;
    roles: Set<string>;
}

export type WsEventPayload<Data = any> = [event: string, data?: Data];

// TODO statemachine events
export interface BaseRoom<State = Map<any, any>> {
    name: string;
    clients: Set<AppWebsocket>;
    watchers: Set<AppWebsocket>;
    state: State;
    internal: Map<any, any>;
    type: "simple" | "game";
    // TODO admin ?
}
export type Room = SimpleRoom | GameRoom;

/**
 * LobbyRoom are used to sync only when events happen and every X seconds
 * Events are broadcasted to everyone else in the room but the sender
 */
export interface SimpleRoom<State = Map<any, any>> extends BaseRoom<State> {
    type: "simple";
    config: RoomConfig;
    hooks: RoomHooks;
}
export interface RoomConfig {
    updateRate: number;
    [key: string]: any;
}

export type RoomEvents =
    | "rooms.list"
    | "rooms.create"
    | "rooms.before.join"
    | "rooms.join"
    | "rooms.before.update"
    | "rooms.update"
    | "rooms.get"
    | "rooms.leave"
    | "rooms.before.kick"
    | "rooms.kick"
    | "rooms.before.delete"
    | "rooms.delete"
    | "rooms.relay"
    | "rooms.broadcast";

export interface RoomContext<T = any> extends Partial<Pick<EventHandlerRef, "broadcastEvent">> {
    ws: AppWebsocket;
    room: T;
    event?: string;
    /** Dot-delimited state path to update, ex: state = new Map({ aaa: { bbb: 111 }}), field = "aaa.bbb" */
    field?: string;
}

export interface RoomHooks<Room = SimpleRoom>
    extends Partial<Record<RoomEvents, (ctx: RoomContext<Room>, payload?: any) => void | boolean>> {}
/**
 * GameRoom are used to handle fast updates
 * Events are broadcasted to everyone at the given tick rate
 */
export interface GameRoom<Meta = Map<any, any>, State = BaseRoom["state"]> extends Omit<BaseRoom, "state"> {
    type: "game";
    meta: Meta;
    state: State;
    config: GameRoomConfig;
    hooks: GameHooks;
}

export type GameEvent =
    | "games.list"
    | "games.create"
    | "games.join"
    | "games.get"
    | "games.leave"
    | "games.kick"
    | "games.update"
    | "games.update.meta"
    | "games.get.meta"
    | "games.delete";

export interface GameContext<T = any> {
    ws: AppWebsocket;
    game: T;
}

export interface GameHooks<Room = GameRoom>
    extends Partial<Record<GameEvent, (ctx: GameContext<Room>, payload?: any) => void | boolean>> {}
export interface GameRoomConfig {
    tickRate: number;
    clientsRefreshRate: number;
    shouldRemovePlayerStateOnDisconnect: boolean;
    [key: string]: any;
}

export type AppWebsocket = WebSocket & {
    id?: string;
    state: Map<any, any>;
    meta: Map<any, any>;
    internal: Map<any, any>;
    roles: Set<UserRole | string>;
    isAlive?: boolean;
    user: WsUser;
};

interface WsEventObject {
    event: string;
    payload: any;
}
export interface EventHandlerRef extends WsEventObject {
    ws: AppWebsocket;
    opts: {
        binary: boolean;
    };
    user: WsUser;
    globalSubscriptions: Map<GlobalSubscription, Set<AppWebsocket>>;
    users: Map<AppWebsocket["id"], WsUser>;
    rooms: Map<string, SimpleRoom>;
    games: Map<string, GameRoom>;

    // Misc
    broadcastEvent: (room: Room, event: string, payload?: any) => void;
    broadcastSub: (sub: GlobalSubscription, [event, payload]: WsEventPayload<any>) => void;
    broadcastPresenceList: (excludeSelf?: boolean) => void;

    // Presence
    getPresenceList: () => any[];
    sendPresenceList: () => void;
    getPresenceMetaList: () => any[];

    // Rooms
    getRoomListEvent: () => WsEventPayload<any>;
    sendRoomsList: () => void;
    onJoinRoom: (room: Room) => void;

    // Games
    getGameRoomListEvent: () => WsEventPayload<any>;
    sendGamesList: () => void;
}

export interface MapObject<Props extends { [key: string]: unknown }> extends Map<keyof Props, Props[keyof Props]> {
    get<K extends keyof Props>(key: K): Props[K];
    set<K extends keyof Props>(key: K, value: Props[K]): this;
}
