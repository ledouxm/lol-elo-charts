import { getRandomColor, makeId } from "@/functions/utils";
import { Player } from "@/types";
import { getRandomIntIn, safeJSONParse, stringify } from "@pastable/core";
import { makePresence } from "./makePresence";

export const getLocalPresence = () => safeJSONParse(sessionStorage.getItem("wss/player")) as Player;
export const persistLocalPresence = (state: Player) => sessionStorage.setItem("wss/player", stringify(state, 0));

export const {
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
} = makePresence(
    getLocalPresence() ||
        ({ id: "g-" + makeId(), username: "Guest-" + getRandomIntIn(0, 1000), color: getRandomColor() } as Player),
    persistLocalPresence
);
