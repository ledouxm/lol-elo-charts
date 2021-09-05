import { EventCallback } from "@/functions/EventEmitter";
import { useSocketEvent, useSocketEventEmitter } from "@/hooks/useSocketConnection";
import { LobbyRoomState } from "@/room/LobbyRoom";
import { AvailableRoom, Player, Room } from "@/types";
import { useConst } from "@chakra-ui/react";
import { AnyFunction, hash, ObjectLiteral, set, sortArrayOfObjectByPropFromArray, updateItem } from "@pastable/core";
import { atom, useAtom } from "jotai";
import { atomFamily } from "jotai/utils";
import { useEffect, useRef } from "react";
import { useMyPresence, usePresenceIsSynced } from "./usePresence";
import { RoomClient, useSocketClient } from "./useSocketClient";

// TODO on un-sync(=ws disconnect), reset everything ?
export const roomListAtom = atom([] as Array<AvailableRoom>);
export const useRoomList = () => {
    const [roomList, setRoomList] = useAtom(roomListAtom);

    const prevStateHashRef = useRef<string>();
    useSocketEvent<Array<AvailableRoom>>("rooms/list", (updated) => {
        const updateHash = hash(updated);
        if (prevStateHashRef.current !== updateHash) {
            setRoomList(updated);
            prevStateHashRef.current = updateHash;
        }
    });

    return roomList;
};

export const roomFamily = atomFamily(
    (props: Room & { isSynced?: boolean }) => atom(props),
    (a, b) => a.name === b.name
);
export const useRoomState = <State extends ObjectLiteral = Room>(name: string) => {
    const initialValue = useConst({ name, clients: [], state: {} });
    const [room, setRoom] = useAtom(roomFamily(initialValue));

    const presence = useMyPresence();
    const isIn = room.clients.some((client) => client.id === presence.id);

    const roomClient = useRoomClient(name);
    const emitter = useSocketEventEmitter();

    const isPresenceSynced = usePresenceIsSynced();

    // Keep track of room.sync, if true this room will receive updates, else the user has not joined the room yet
    useEffect(() => {
        if (isPresenceSynced && room.isSynced) return;

        let cleanup;
        if (isPresenceSynced) {
            const cb = () => setRoom((room) => ({ ...room, isSynced: true }));
            cleanup = emitter.once("rooms/join#" + name, cb);
        } else {
            setRoom((room) => ({ ...room, isSynced: false }));
        }

        if (!room.isSynced) {
            roomClient.get();
        }

        return () => {
            cleanup?.();
        };
    }, [isPresenceSynced, room.isSynced]);

    // Init room hash to compare server updates to
    const prevStateHashRef = useRef<string>();
    useEffect(() => {
        prevStateHashRef.current = hash(initialValue);
    }, []);

    // Set room as unsynchronized on leave/kick + remove self from room.clients
    useRoomEvent("rooms/leave#" + name, () => {
        setRoom((current) => ({
            ...current,
            isSynced: false,
            clients: current.clients.filter((client) => client.id !== presence.id),
        }));
    });

    // Granular state updates whenever someone triggers a state change
    useRoomEvent<Partial<State>>("rooms/update#" + name, (update) => {
        setRoom((current) => {
            Object.entries(update).map(([key, value]) => {
                const paths = key.split(".");
                const first = paths[0];

                const prop = room.state[first];
                if (paths.length > 1) {
                    const clone = { ...(prop || {}) };
                    set(clone, paths.slice(1).join("."), value);

                    current.state[first] = clone;
                } else {
                    current.state[key] = value;
                }
            });
            const updated = { ...current, state: { ...current.state } };
            const updateHash = hash(updated);

            if (prevStateHashRef.current !== updateHash) {
                prevStateHashRef.current = updateHash;
                return updated;
            }

            return current;
        });
    });

    // Granular state updates whenever someone triggers a state change on a specific field
    useRoomEvent<Partial<State>>("rooms/update:*#" + name, (payload, _event, path) => {
        setRoom((current) => {
            const updated = { ...current };
            set(updated, "state." + path, payload);
            const updateHash = hash(updated);

            if (prevStateHashRef.current !== updateHash) {
                prevStateHashRef.current = updateHash;
                return updated;
            }

            return current;
        });
    });

    // Full room, retrieved every X seconds
    useRoomEvent<Room>("rooms/state#" + name, (updated) => {
        const updateHash = hash(updated);
        if (prevStateHashRef.current !== updateHash) {
            setRoom(updated);
            prevStateHashRef.current = updateHash;
        }
    });

    // Reset room with that name on deleted
    useRoomEvent("rooms/delete#" + name, () => setRoom(initialValue));

    // Add (or update) clients on join
    useRoomEvent<Player>("rooms/join#" + name, (newClient) => {
        setRoom((current) => ({
            ...current,
            clients: current.clients.some((client) => client.id === newClient.id)
                ? updateItem(current.clients, "id", newClient)
                : current.clients.concat(newClient),
        }));
    });

    // Update room.clients when their presence is updated
    useSocketEvent<Array<Player>>(
        "presence/list",
        (update) => {
            console.log("presecne/list");
            setRoom((current) => {
                const updated = {
                    ...current,
                    clients: sortArrayOfObjectByPropFromArray(
                        update.filter((presence) => current.clients.some((inRoom) => inRoom.id === presence.id)),
                        "id",
                        current.clients.map((client) => client.id)
                    ),
                };
                const updateHash = hash(updated);

                if (prevStateHashRef.current !== updateHash) {
                    prevStateHashRef.current = updateHash;
                    return updated;
                }

                return current;
            });
        },
        name
    );

    return {
        ...room,
        state: room.state as State,
        isIn,
        setRoom,
        ...roomClient,
    };
};

const useRoomEvent = <T = any>(event: string, callback: EventCallback<T>) =>
    useSocketEvent(event, callback, getEventParam(event));
const getEventParam = (event: string, separator = "#") => event.split(separator)[1];

export const useRoomClient = (name: Room["name"]) => {
    const client = useSocketClient();
    const roomClient = useConst(makeSpecificRoomClient(client.rooms, name));

    const emitter = useSocketEventEmitter();
    const once = (event: string, cb: AnyFunction) => emitter.once(`rooms/${event}#${name}`, cb);

    return { ...roomClient, once };
};

export type UseRoomStateReturn<State extends ObjectLiteral = LobbyRoomState> = ReturnType<typeof useRoomState> & {
    state: State;
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
    kick: (id: Player["id"]) => client.leave.apply(null, [name, id]) as void,
    delete: () => client.delete.apply(null, [name]) as void,
    relay: (msg: any) => client.relay.apply(null, [name, msg]) as void,
    broadcast: (msg: any) => client.broadcast.apply(null, [name, msg]) as void,
});
