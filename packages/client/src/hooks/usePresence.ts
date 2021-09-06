import { Player } from "@/types";
import { safeJSONParse, stringify } from "@pastable/core";
import { makePresence } from "./makePresence";

export const getLocalPresence = () => safeJSONParse(sessionStorage.getItem("wss/player")) as Player;
export const persistLocalPresence = (state: Player) => sessionStorage.setItem("wss/player", stringify(state));

export const {
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
} = makePresence(getLocalPresence(), persistLocalPresence);
