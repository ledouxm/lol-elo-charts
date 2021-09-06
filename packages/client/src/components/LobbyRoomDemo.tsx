import { successToast } from "@/functions/toasts";
import { useMyPresence } from "@/hooks/usePresence";
import { useRoomState } from "@/hooks/useRoomState";
import { AvailableRoom, Room } from "@/types";
import { Button, Stack } from "@chakra-ui/react";
import { getRandomString } from "@pastable/core";

// TODO colyseus-monitor like
export const LobbyRoomDemo = ({ availableRoom }: { availableRoom: AvailableRoom }) => {
    const roomName = availableRoom.name;

    const me = useMyPresence();
    const room = useRoomState<DemoRoomState>(roomName);
    const toggleDone = () => room.update({ mark: !room.state.mark });
    console.log(room.state, room.isIn, room.clients);

    return (
        <Stack border="1px solid teal">
            <Stack direction="row">
                <span>id: {room.name}</span>
                <span>ctx mark: {room.state.mark ? "done" : "empty"}</span>
            </Stack>
            <span>clients: {availableRoom.clients.map((id) => id).toString()}</span>
            <span>names: {room.clients.map((player) => player.username).toString()}</span>
            {room.state.status === "waiting" &&
                (room.isIn ? (
                    <>
                        <Button onClick={() => room.leave()}>Leave</Button>
                        <Button onClick={toggleDone}>Toggle done</Button>
                        <Button
                            onClick={() => {
                                room.get();
                                room.once("state", (room: Room) =>
                                    successToast({
                                        title: room.name,
                                        description: room.clients
                                            .map((player) => player.username + " - " + player.color)
                                            .toString(),
                                    })
                                );
                            }}
                        >
                            Get
                        </Button>
                        <Button onClick={() => room.broadcast([getRandomString()])}>Broadcast</Button>
                        <Button onClick={() => room.relay([getRandomString()])}>Relay</Button>
                    </>
                ) : (
                    <Button onClick={() => room.join()}>Join</Button>
                ))}
            <Button onClick={() => room.delete()}>Remove</Button>
            {room.clients.some((player) => player.id !== me.id) && (
                <Button onClick={() => room.kick(room.clients.find((player) => player.id !== me.id).id)}>
                    Kick (not me)
                </Button>
            )}
        </Stack>
    );
};

interface DemoRoomState {
    status: string;
    mark: boolean;
}
