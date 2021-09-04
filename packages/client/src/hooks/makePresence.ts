import { WsEvent } from "@/functions/ws";
import { useSocketEmit, useSocketEvent } from "@/hooks/useSocketConnection";
import { isType, ObjectLiteral, SetState } from "@pastable/core";
import { atom, useAtom } from "jotai";
import { useAtomValue, useUpdateAtom } from "jotai/utils";
import { SetStateAction } from "react";

export const makePresence = <Value extends ObjectLiteral>(
    initialPresence: Value,
    onUpdate?: (presence: Value) => void
) => {
    // Presence sync
    const isSyncedAtom = atom(false);
    const usePresenceIsSynced = () => useAtomValue(isSyncedAtom);
    const usePresenceInit = () => {
        const setLocalPresence = useUpdateAtom(myPresenceAtom);
        const setIsSynced = useUpdateAtom(isSyncedAtom);
        const setPresenceList = useUpdateAtom(presenceListAtom);

        useSocketEvent("presence/state", (update: Value) => {
            onUpdate(update);
            setLocalPresence(update);
            setIsSynced(true);
        });
        useSocketEvent("presence/list", setPresenceList);

        const onDisconnect = () => {
            setIsSynced(false);
            setPresenceList([]);
        };
        useSocketEvent(WsEvent.Close, onDisconnect);
        useSocketEvent(WsEvent.Error, onDisconnect);
    };

    // Presence State
    const presenceListAtom = atom([] as Array<Value>);
    const usePresenceList = () => useAtomValue(presenceListAtom);
    const useOtherPresences = () => usePresenceList().filter((presence) => initialPresence.id !== presence.id);

    const myPresenceAtom = atom(initialPresence as Value);
    const useMyPresence = () => useAtomValue(myPresenceAtom);
    const useUpdatePresence = (): SetState<Value> => {
        const emit = useSocketEmit();
        const [localPresence, setLocalPresence] = useAtom(myPresenceAtom);

        return (state: SetStateAction<Value>) => {
            const current = isType<Function>(state, typeof state === "function") ? state(localPresence) : state;
            onUpdate(current);
            setLocalPresence(current);
            emit("presence.update", current);
        };
    };
    const useLocalPresence = (): [ReturnType<typeof useMyPresence>, ReturnType<typeof useUpdatePresence>] => [
        useMyPresence(),
        useUpdatePresence(),
    ];

    return {
        isSyncedAtom,
        presenceListAtom,
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
