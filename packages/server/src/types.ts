import WebSocket from "ws";

export type GlobalSubscription = "presence" | "rooms" | "games";

export interface User {
    clients: Set<AppWebsocket>;
    rooms: Set<Room | GameRoom>;
}

export type WsEventPayload<Data = any> = [event: string, data?: Data];

// TODO statemachine events
export interface BaseRoom {
    name: string;
    clients: Set<AppWebsocket>;
    state: Map<any, any>;
    internal: Map<any, any>;
    type: "lobby" | "game";
    // TODO admin ?
}
export type Room = LobbyRoom | GameRoom;

/**
 * LobbyRoom are used to sync only when events happen and every X seconds
 * Events are broadcasted to everyone else in the room but the sender
 */
export interface LobbyRoom extends BaseRoom {
    type: "lobby";
    config: RoomConfig;
}
export interface RoomConfig {
    updateRate: number;
    [key: string]: any;
}

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
    extends Partial<Record<GameEvent, (ctx: GameContext<Room>, payload?: any) => void | Partial<Room>>> {}
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
    isAlive?: boolean;
    user: User;
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
    user: User;
    globalSubscriptions: Map<GlobalSubscription, Set<AppWebsocket>>;
    rooms: Map<string, LobbyRoom>;
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
