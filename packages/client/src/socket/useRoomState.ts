import { EventCallback } from "@/functions/EventEmitter";
import { useSocketEvent, useSocketEventEmitter } from "@/socket/useSocketConnection";
import { LobbyRoomState } from "@/room/LobbyRoom";
import { AvailableRoom, Player, Room } from "@/types";
import { useConst } from "@chakra-ui/react";
import { AnyFunction, hash, ObjectLiteral, pick, set } from "@pastable/core";
import { atom, useAtom } from "jotai";
import { atomFamily } from "jotai/utils";
import { useEffect, useRef } from "react";
import { presencesMapAtom, useMyPresence, usePresenceIsSynced } from "./usePresence";
import { makeSpecificRoomClient, useSocketClient } from "./useSocketClient";

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

const roomFamily = atomFamily(
    (props: Room & { clientIds: Array<string> }) => {
        const baseAtom = atom(props);

        // Pick clients in presenceMap using baseAtom.clientIds
        const clientsAtom = atom((get) => {
            const room = get(baseAtom);
            const presenceMap = get(presencesMapAtom);
            const clients = Object.values(pick(presenceMap, room.clientIds || [])).filter(Boolean);
            return clients;
        });
        // Shared ref so that any useRoomState instance can share the same context without re-renders
        const ref = { current: {} as ObjectLiteral };

        return atom(
            (get) => {
                const room = get(baseAtom);
                const clients = get(clientsAtom);

                return {
                    ...props,
                    ...room,
                    ref,
                    clients: clients.map((client) => client.state),
                    clientsMeta: clients.map((client) => client.meta),
                    presences: clients,
                };
            },
            (get, set, update) => {
                // Set baseAtom, update is like a useState update here
                const newState = typeof update === "function" ? update(get(baseAtom)) : update;

                set(baseAtom, newState);
            }
        );
    },
    (a, b) => a.name === b.name
);
const roomSyncedFamily = atomFamily(
    (props: { name: string; isSynced: boolean }) => atom(props),
    (a, b) => a.name === b.name
);
export const useRoomState = <State extends ObjectLiteral = Room>(name: string) => {
    const initialValue = useConst({ name, clients: [], clientIds: [], state: {} });
    const [room, setRoom] = useAtom(roomFamily(initialValue));
    const [roomSync, setRoomSync] = useAtom(roomSyncedFamily({ name, isSynced: false }));
    const isRoomSynced = roomSync.isSynced;

    const presence = useMyPresence();
    const isIn = room.clients.some((client) => client.id === presence.id);

    const roomClient = useRoomClient(name);
    const emitter = useSocketEventEmitter();

    const isPresenceSynced = usePresenceIsSynced();

    // Keep track of room.sync, if true this room will receive updates, else the user has not joined the room yet
    useEffect(() => {
        if (isPresenceSynced && isRoomSynced) return;

        let cleanup;
        if (isPresenceSynced) {
            const cb = () => setRoomSync({ name, isSynced: true });
            cleanup = emitter.once("rooms/join#" + name, cb);
        } else {
            setRoomSync({ name, isSynced: false });
        }

        if (!isRoomSynced) {
            roomClient.get();
        }

        return () => {
            cleanup?.();
        };
    }, [isPresenceSynced, isRoomSynced]);

    // Init room hash to compare server updates to
    const prevStateHashRef = useRef<string>();
    useEffect(() => {
        prevStateHashRef.current = hash(initialValue.state);
    }, []);

    // Set room as unsynchronized on leave/kick + remove self from room.clients
    useRoomEvent("rooms/leave#" + name, () => {
        setRoom((current: Room) => ({
            ...current,
            clientIds: current.clients.filter((client) => client.id !== presence.id).map((item) => item.id),
        }));
        setRoomSync({ name, isSynced: false });
    });

    // Granular state updates whenever someone triggers a state change
    useRoomEvent<Partial<State>>("rooms/update#" + name, (update) => {
        setRoom((current: Room) => {
            const state = { ...current.state };
            Object.entries(update).map(([key, value]) => {
                const paths = key.split(".");
                const first = paths[0];

                const prop = room.state[first];
                if (paths.length > 1) {
                    const clone = { ...(prop || {}) };
                    set(clone, paths.slice(1).join("."), value);

                    state[first] = clone;
                } else {
                    state[key] = value;
                }
            });
            const updateHash = hash(state);

            if (prevStateHashRef.current !== updateHash) {
                prevStateHashRef.current = updateHash;
                return { ...current, state };
            }

            return current;
        });
    });

    // Granular state updates whenever someone triggers a state change on a specific field
    useRoomEvent<Partial<State>>("rooms/update:*#" + name, (payload, _event, path) => {
        setRoom((current: Room) => {
            const state = { ...current.state };
            set(state, path, payload);
            const updateHash = hash(state);

            if (prevStateHashRef.current !== updateHash) {
                prevStateHashRef.current = updateHash;
                return { ...current, state };
            }

            return current;
        });
    });

    // Full room, retrieved every X seconds
    useRoomEvent<Room>("rooms/state#" + name, (updated) => {
        const updateHash = hash(updated);
        if (prevStateHashRef.current !== updateHash) {
            setRoom((current) => ({ ...current, state: updated }));
            prevStateHashRef.current = updateHash;
        }

        if (!roomSync.isSynced) {
            setRoomSync({ name, isSynced: true });
        }
    });

    // Reset room with that name on deleted
    useRoomEvent("rooms/delete#" + name, () => setRoom(initialValue));

    // Pick clients from presence map
    useRoomEvent<Array<Player>>("rooms/presence#" + name, (list) => {
        setRoom((current) => ({ ...current, clientIds: list.map((item) => item.id).sort() }));
    });

    return {
        ...room,
        state: room.state as State,
        isIn,
        isSynced: roomSync.isSynced,
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
