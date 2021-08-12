import { stringify } from "@pastable/core";
import { makePresence } from "jotai-yjs";
import { useEffect } from "react";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import { Player } from "../types";
import { makePlayer } from "./utils";

const yDocId = "app";
// const wsUrl = "ws://localhost:1339";
const wsUrl = "wss://y.svelt-yjs.dev";

export const yDoc = new Y.Doc({ guid: yDocId });
export const provider = new WebsocketProvider(wsUrl, yDoc.guid, yDoc, { connect: false });

const getPlayer = (): Player => {
    const player = sessionStorage.getItem(yDocId + "/player");
    return player ? JSON.parse(player) : makePlayer();
};
const player = getPlayer();
const persistPlayer = (player: Player) => sessionStorage.setItem(yDocId + "/player", stringify(player));

let cpt = 0;

const addProviderToDoc = () => {
    console.log("connect to a ws provider with room", yDoc.guid);

    provider.url = wsUrl + "?" + new URLSearchParams({ auth: "chainbreak" }).toString();
    provider.connect();

    const currentPlayers = provider.awareness.getStates();

    const newPlayer = { ...player, isAdmin: currentPlayers.size === 1, index: cpt };
    provider.awareness.setLocalState(newPlayer);
    cpt++;
    console.log(newPlayer, currentPlayers);

    persistPlayer(player);

    return () => {
        console.log("disconnect", yDoc.guid);
        provider.destroy();
    };
};

export const useProviderInit = () => {
    useEffect(() => {
        const unmount = addProviderToDoc();
        return () => unmount();
    }, []);

    return yDoc;
};

export const { useYAwarenessInit, useYAwareness, presenceProxy, usePresence, usePresenceSnap } = makePresence({
    provider,
    initialPresence: player,
    onUpdate: persistPlayer,
});

export const hexagonsYMap = yDoc.getMap("hexagons");
