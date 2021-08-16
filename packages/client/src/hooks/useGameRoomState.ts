import { useSocketEvent, useSocketEventEmitter } from "@/hooks/useSocketConnection";
import { Player, Room } from "@/types";
import { useConst } from "@chakra-ui/react";
import { AnyFunction, ObjectLiteral, sortArrayOfObjectByPropFromArray, updateItem } from "@pastable/core";
import { atom, useAtom } from "jotai";
import { atomFamily, useAtomValue } from "jotai/utils";
import { initialPresence } from "./usePresence";
import { makeSpecificRoomClient } from "./useRoomState";
import { GameRoomClient, useSocketClient } from "./useSocketClient";

export const gameRefFamily = atomFamily(
    (props: Room) => atom({ current: props }),
    (a, b) => a.name === b.name
);
/** Will not trigger a single re-render but rather return a ref that will be constantly updated */
export const useGameRoomRef = <State extends ObjectLiteral = Room>(name: string) => {
    const gameRef = useAtomValue(gameRefFamily({ name, clients: [], state: {} }));

    const emitter = useSocketEventEmitter();
    const once = (event: string, cb: AnyFunction) => emitter.once(`games/${event}#${name}`, cb);

    // Update state every tick
    useSocketEvent("games/state#" + name, (state) => (gameRef.current.state = state));

    // Update clients every X seconds
    useSocketEvent<Array<Player>>("games/clients#" + name, (clients) => (gameRef.current.clients = clients));

    // Add (or update) clients on join
    useSocketEvent<Player>(
        "rooms/join#" + name,
        (newClient) =>
            (gameRef.current.clients = gameRef.current.clients.some((client) => client.id === newClient.id)
                ? updateItem(gameRef.current.clients, "id", newClient)
                : gameRef.current.clients.concat(newClient))
    );

    // Remove self from room.clients on leave
    useSocketEvent("rooms/leave#" + name, () => {
        gameRef.current.clients = gameRef.current.clients.filter((client) => client.id !== initialPresence.id);
    });

    // Update room.clients when their presence is updated
    useSocketEvent<Array<Player>>("presence/list", (update) => {
        const clients = sortArrayOfObjectByPropFromArray(
            update.filter((presence) => gameRef.current.clients.some((inRoom) => inRoom.id === presence.id)),
            "id",
            gameRef.current.clients.map((client) => client.id)
        );
        gameRef.current.clients = clients;
    });

    const client = useSocketClient();
    const gameClient = useConst(makeSpecificGameRoomClient(client.games, name));

    return { ref: gameRef as { current: Room & State }, once, ...gameClient };
};

export const gameFamily = atomFamily(
    (props: Room) => atom(props),
    (a, b) => a.name === b.name
);

/** Will trigger re-render on each updates */
export const useGameRoomState = <State extends ObjectLiteral = Room>(name: string) => {
    const initialValue = useConst({ name, clients: [], state: {} });
    const [game, setGame] = useAtom(gameFamily(initialValue));

    const emitter = useSocketEventEmitter();
    const once = (event: string, cb: AnyFunction) => emitter.once(`games/${event}#${name}`, cb);

    // Update state every tick
    useSocketEvent("games/state#" + name, (state) => setGame((current) => ({ ...current, state })));

    // Update clients every X seconds
    useSocketEvent<Array<Player>>("games/clients#" + name, (clients) =>
        setGame((current) => ({ ...current, clients }))
    );

    // Add (or update) clients on join
    useSocketEvent("rooms/join#" + name, (newClient: Player) =>
        setGame((current) => ({
            ...current,
            clients: current.clients.some((client) => client.id === newClient.id)
                ? updateItem(current.clients, "id", newClient)
                : current.clients.concat(newClient),
        }))
    );

    // Remove self from room.clients on leave
    useSocketEvent("rooms/leave#" + name, () => {
        setGame((current) => ({
            ...current,
            clients: current.clients.filter((client) => client.id !== initialPresence.id),
        }));
    });

    // Update room.clients when their presence is updated
    useSocketEvent<Array<Player>>("presence/list", (update) => {
        setGame((current) => {
            const clients = sortArrayOfObjectByPropFromArray(
                update.filter((presence) => current.clients.some((inRoom) => inRoom.id === presence.id)),
                "id",
                current.clients.map((client) => client.id)
            );

            return { ...current, clients };
        });
    });

    const client = useSocketClient();
    const gameClient = useConst(makeSpecificGameRoomClient(client.games, name));

    return { name: game.name, state: game.state as Room & State, clients: game.clients, once, ...gameClient };
};

const makeSpecificGameRoomClient = (client: GameRoomClient, name: Room["name"]) => ({
    ...makeSpecificRoomClient(client as any, name),
    create: (gameId: string, initialData: { initialState?: ObjectLiteral; type?: string }) =>
        client.create.apply(null, [gameId, initialData]) as void,
    getMeta: (update: ObjectLiteral, fields?: Array<string>) =>
        client.getMeta.apply(null, [name, update, fields]) as void,
    updateMeta: (update: ObjectLiteral, field?: string) => client.updateMeta.apply(null, [name, update, field]) as void,
});
