import { useGameRoomState } from "@/hooks/useGameRoomState";
import { usePresenceIsSynced } from "@/hooks/usePresence";
import { useSocketEvent } from "@/hooks/useSocketConnection";
import { Hexagon, hexagonsAtom } from "@/platformer/features/Hexagon";
import { useUpdateAtom } from "jotai/utils";
import { useEffect } from "react";

export const useLobbyEvents = () => {};

export const gameName = "bbbbbb";

export const AppSocket = () => {
    const isSynced = usePresenceIsSynced();
    const game = useGameRoomState(gameName);

    const setHexagons = useUpdateAtom(hexagonsAtom);

    useSocketEvent<{ hexagons: Hexagon }>("games/get.meta#" + gameName, (meta) => {
        setHexagons(meta.hexagons);
    });
    useSocketEvent<Hexagon>("games/update.meta#" + gameName, (updatedHexs) => {
        console.log(updatedHexs);
    });
    useEffect(() => {
        if (!isSynced) return;
        game.create("platformer");
        game.join();
    }, [isSynced]);

    return null;
};
