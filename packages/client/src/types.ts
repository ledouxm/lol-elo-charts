export interface Player {
    id: string;
    username: string;
    color: string;
}
export interface Game {
    id: string;
    players: Array<Player>;
    mode: "duel" | "free-for-all";
}

export interface Room {
    id: string;
    clients: Array<Player>;
}
