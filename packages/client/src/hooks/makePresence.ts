import { WsEvent } from "@/functions/ws";
import { useSocketEmit, useSocketEvent } from "@/hooks/useSocketConnection";
import { isType, ObjectLiteral, pick, SetState } from "@pastable/core";
import { atom } from "jotai";
import { atomFamily, useAtomValue, useUpdateAtom } from "jotai/utils";
import { SetStateAction, useRef } from "react";

export const makePresence = <Value extends ObjectLiteral>(
    initialPresence: Value,
    onUpdate?: (presence: Value) => void
) => {
    // Presence sync
    const isSyncedAtom = atom(false);
    const usePresenceIsSynced = () => useAtomValue(isSyncedAtom);

    // Presence State
    const presencesMapAtom = atom({ [initialPresence.id]: { state: initialPresence, meta: {} } } as PresenceMap<Value>);
    const presenceFamilyAtom = atomFamily((id: string) => atom((get) => get(presencesMapAtom)[id]));

    // Either set state or meta at presence.id in map
    const useSetPresenceInMap = () => {
        const setPresenceMap = useUpdateAtom(presencesMapAtom);
        return (presence: Value, key: "state" | "meta" = "state") =>
            setPresenceMap((current) => ({
                ...current,
                [presence.id]: { ...current[presence.id], [key]: presence },
            }));
    };

    /** Init presence listeners, should only be used once in the top of the app */
    const usePresenceInit = () => {
        const setIsSynced = useUpdateAtom(isSyncedAtom);
        const setPresenceMap = useUpdateAtom(presencesMapAtom);
        const updatePresence = useSetPresenceInMap();

        const onlinePresenceRef = useRef<Value>(initialPresence);

        // Update self presence in map
        useSocketEvent<Value>("presence/state", (update) => {
            onUpdate(update);
            onlinePresenceRef.current = update;
            setIsSynced(true);
            updatePresence(update);
        });

        // Update presence map from global presence list
        useSocketEvent<Array<Value>>("presence/list", (list) =>
            setPresenceMap((current) =>
                Object.fromEntries(list.map((item) => [item.id, { meta: {}, ...current[item.id], state: item }]))
            )
        );
        // TODO presence/list:meta ?

        // Update presence map from presence in rooms
        useSocketEvent<Array<Value>>("rooms/presence#*", (list) => {
            setPresenceMap((current) => ({
                ...current,
                ...Object.fromEntries(list.map((item) => [item.id, { meta: {}, ...current[item.id], state: item }])),
            }));
        });

        /** Update a specific presence state */
        useSocketEvent<Value>("presence/state#*", (update) => updatePresence(update));

        /** Update a specific presence state */
        useSocketEvent<Value>("presence/meta#*", (update) => updatePresence(update, "meta"));

        /** Remove all presence but self on disconnect / set as unsynced */
        const onDisconnect = () => {
            setIsSynced(false);
            setPresenceMap((current) => ({ ...pick(current, [onlinePresenceRef.current.id]) }));
        };
        useSocketEvent(WsEvent.Close, onDisconnect);
        useSocketEvent(WsEvent.Error, onDisconnect);
    };

    // Derived atoms
    const presenceListAtom = atom((get) => Object.values(get(presencesMapAtom)).map((item) => item.state));
    const otherPresencesAtom = atom((get) =>
        get(presenceListAtom).filter((item) => item.state.id !== initialPresence.id)
    );
    const myPresenceAtom = atom((get) => get(presenceFamilyAtom(initialPresence.id)));

    const usePresenceList = () => useAtomValue(presenceListAtom);
    const useOtherPresences = () => useAtomValue(otherPresencesAtom);
    const useMyPresence = () => useAtomValue(myPresenceAtom)?.state;

    /** Hook to update self presence state both locally + emit update to the server */
    const useUpdatePresence = (): SetState<Value> => {
        const emit = useSocketEmit();
        const localPresence = useAtomValue(myPresenceAtom);
        const updatePresence = useSetPresenceInMap();

        return (update: SetStateAction<Value>) => {
            const current = isType<Function>(update, typeof update === "function")
                ? update(localPresence.state)
                : update;
            onUpdate(current);
            updatePresence(current);
            emit("presence.update", current);
        };
    };

    /** Like useState but for self-presence state */
    const useLocalPresence = (): [ReturnType<typeof useMyPresence>, ReturnType<typeof useUpdatePresence>] => [
        useMyPresence(),
        useUpdatePresence(),
    ];

    return {
        isSyncedAtom,
        presencesMapAtom,
        presenceListAtom,
        presenceFamilyAtom,
        myPresenceAtom,
        usePresenceIsSynced,
        usePresenceInit,
        usePresenceList,
        useOtherPresences,
        useMyPresence,
        useUpdatePresence,
        useLocalPresence,
    };
};

type PresenceMap<Value> = Record<string, { state: Value; meta: ObjectLiteral }>;
