import { useSocketConnection, useSocketEmit, useSocketEvent } from "@/hooks/useSocketConnection";
import { Button } from "@chakra-ui/react";
import { omit } from "@pastable/core";
import { atom, useAtom } from "jotai";
import { atomFamily, useAtomValue, useUpdateAtom } from "jotai/utils";
import { useState } from "react";

export interface Payload {
    id: string;
    position?: [0, 0, 0];
    rotation?: [0, 0, 0];
    color?: string;
}
export interface Hexagon {
    id: string;
    status: string;
}

export const playersAtom = atom<Payload[]>([]);
export const hexagonsAtom = atom<Hexagon[]>([]);
export const meAtom = atom<Payload>(null as Payload);

const useLobbyEvents = () => {
    const setPlayers = useUpdateAtom(playersAtom);
    const setHexagons = useUpdateAtom(hexagonsAtom);
    const setMe = useUpdateAtom(meAtom);

    useSocketEvent("ME", setMe);
    useSocketEvent("INITIAL_H", (hexArr: any[]) => setHexagons(hexArr.map(([id, status]) => ({ id, status }))));
    useSocketEvent("INITIAL_H", (data) => console.log(data));

    useSocketEvent("LEFT", (id: string) => setPlayers((current) => current.filter((player) => player.id !== id)));
    useSocketEvent("NEW_PLAYER", (player: Payload) => setPlayers((current) => [...current, player]));
    useSocketEvent("INITIAL_PLAYERS", (data: Payload[]) => setPlayers(data));
    useSocketEvent("PLAYERS", (data: Payload[]) =>
        setPlayers((players) => {
            const newPlayers = [...players];
            data.forEach((player) => {
                const matchingIndex = newPlayers.findIndex((newPlayer) => player.id === newPlayer.id);

                if (matchingIndex === -1) return;

                const diff = omit(player, ["id"]);
                Object.entries(diff).forEach(([key, value]) => (newPlayers[matchingIndex][key] = value));
            });
            return newPlayers;
        })
    );
};
export const AppSocket = () => {
    useSocketConnection();
    useLobbyEvents();

    return null;
};
