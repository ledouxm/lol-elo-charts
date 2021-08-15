import { makePlayer } from "@/functions/utils";
import { Player } from "@/types";
import { safeJSONParse, stringify } from "@pastable/core";
import { makePresence } from "./makePresence";

export const getLocalPresence = () => safeJSONParse(sessionStorage.getItem("wss/player")) as Player;
export const persistLocalPresence = (state: Player) => sessionStorage.setItem("wss/player", stringify(state));

export const initialPresence = getLocalPresence() || makePlayer();
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
} = makePresence(initialPresence, persistLocalPresence);
