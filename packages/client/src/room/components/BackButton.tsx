import { Button } from "@chakra-ui/react";
import { useUpdateAtom } from "jotai/utils";
import { useContext } from "react";
import { RoomContext, roomNameAtom } from "../RoomPage";

export const BackButton = () => {
    const roomState = useContext(RoomContext);
    const setRoomName = useUpdateAtom(roomNameAtom);

    const leave = () => {
        roomState.leave();
        setRoomName("");
    };

    return <Button onClick={() => leave()}>Back</Button>;
};
