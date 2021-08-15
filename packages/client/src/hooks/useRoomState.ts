import { useSocketEvent, useSocketEventEmitter } from "@/hooks/useSocketConnection";
import { AvailableRoom, Player, Room } from "@/types";
import { useConst } from "@chakra-ui/react";
import { AnyFunction, hash, ObjectLiteral, sortArrayOfObjectByPropFromArray, updateItem } from "@pastable/core";
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
    (props: Room) => atom(props),
    (a, b) => a.name === b.name
);
export const roomIsSyncedFamily = atomFamily(
    (name: string) => atom(false),
    (a, b) => a === b
);
export const useRoomState = <State extends ObjectLiteral = Room>(name: string) => {
    const initialValue = useConst({ name, clients: [], state: {} });
    const [room, setRoom] = useAtom(roomFamily(initialValue));

    const client = useSocketClient();
    const roomClient = useConst(makeSpecificRoomClient(client.rooms, name));

    const presence = useMyPresence();
    const isIn = room.clients.some((client) => client.id === presence.id);

    const emitter = useSocketEventEmitter();
    const once = (event: string, cb: AnyFunction) => emitter.once(`rooms/${event}#${name}`, cb);

    const isPresenceSynced = usePresenceIsSynced();
    const [isSynced, setRoomSynced] = useAtom(roomIsSyncedFamily(name));

    // Keep track of room.sync, if true this room will receive updates, else the user has not joined the room yet
    useEffect(() => {
        if (isPresenceSynced) return roomClient.get();
        if (isSynced) return;

        let cleanup;
        if (isPresenceSynced) {
            const cb = () => setRoomSynced(true);
            cleanup = emitter.once("rooms/join#" + name, cb);
        } else {
            setRoomSynced(false);
        }

        return () => {
            cleanup?.();
        };
    }, [isPresenceSynced, isSynced]);

    // Set room as unsynchronized on leave/kick + remove self from room.clients
    useSocketEvent("rooms/leave#" + name, () => {
        setRoomSynced(false);
        setRoom((current) => ({ ...current, clients: current.clients.filter((client) => client.id !== presence.id) }));
    });

    // Init room hash to compare server updates to
    const prevStateHashRef = useRef<string>();
    useEffect(() => {
        prevStateHashRef.current = hash(initialValue);
    }, []);

    // Granular state updates whenever someone triggers a state change
    useSocketEvent<Partial<State>>("rooms/update#" + name, (update) => {
        setRoom((current) => {
            const updated = { ...current, state: { ...current.state, ...(update || {}) } };
            const updateHash = hash(updated);

            if (prevStateHashRef.current !== updateHash) {
                prevStateHashRef.current = updateHash;
                return updated;
            }

            return current;
        });
    });

    // Full room, retrieved every X seconds
    useSocketEvent<Room>("rooms/state#" + name, (updated) => {
        const updateHash = hash(updated);
        if (prevStateHashRef.current !== updateHash) {
            setRoom(updated);
            prevStateHashRef.current = updateHash;
        }
    });

    // Reset room with that name on deleted
    useSocketEvent("rooms/delete#" + name, () => setRoom(initialValue));

    // Add (or update) clients on join
    useSocketEvent<Player>("rooms/join#" + name, (newClient) => {
        setRoom((current) => ({
            ...current,
            clients: current.clients.some((client) => client.id === newClient.id)
                ? updateItem(current.clients, "id", newClient)
                : current.clients.concat(newClient),
        }));
    });

    // Update room.clients when their presence is updated
    useSocketEvent<Array<Player>>("presence/list", (update) => {
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
    });

    return { name: room.name, state: room.state as State, clients: room.clients, isIn, isSynced, once, ...roomClient };
};

export const makeSpecificRoomClient = (client: RoomClient, name: Room["name"]) => ({
    ...client,
    get: () => client.get.apply(null, [name]) as void,
    join: () => client.join.apply(null, [name]) as void,
    create: () => client.create.apply(null, [name]) as void,
    update: (update: ObjectLiteral) => client.update.apply(null, [name, update]),
    leave: () => client.leave.apply(null, [name]) as void,
    kick: (id: Player["id"]) => client.leave.apply(null, [name, id]) as void,
    delete: () => client.delete.apply(null, [name]) as void,
    relay: (msg: any) => client.relay.apply(null, [name, msg]) as void,
    broadcast: (msg: any) => client.broadcast.apply(null, [name, msg]) as void,
});
