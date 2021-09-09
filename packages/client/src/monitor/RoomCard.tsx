import { successToast } from "@/functions/toasts";
import { useMyPresence } from "@/socket/usePresence";
import { useRoomState } from "@/socket/useRoomState";
import { AvailableRoom, Player, Room } from "@/types";
import { Button, Menu, MenuButton, MenuItem, MenuList, Stack, Tag, Tooltip } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { getRandomString } from "@pastable/core";
import { Debug } from "../components/Debug";
import { RoomClientsTable } from "./RoomClientsTable";
import { useEffect } from "react";
import { LobbyRoomState } from "@/room/LobbyRoom";

// TODO card style ? https://choc-ui.tech/docs/elements/cards#cards/ma
export const RoomCard = ({ availableRoom }: { availableRoom: AvailableRoom }) => {
    const room = useRoomState<LobbyRoomState>(availableRoom.name);
    const clientsCount = room.isSynced ? room.clients.length : availableRoom.clients.length;

    // Force room sync on clients diff between rooms/list.clients & useRoomState.clients
    useEffect(() => {
        if (availableRoom.clients.length !== room.clients.length) {
            room.get();
        }
    }, [availableRoom.clients]);

    return (
        <Stack border="1px solid teal" p="3">
            <Stack direction="row" justifyContent="space-between">
                <div>
                    <Tag colorScheme="teal">{room.name}</Tag>
                </div>
                <div>
                    <RoomDetailsControls room={room} />
                </div>
            </Stack>
            <div>
                <Debug
                    data={availableRoom.clients.map((id) => id).toString()}
                    withToggle
                    label={`clients (${clientsCount})`}
                    initialState={Boolean(availableRoom.clients.length)}
                />
                <Debug data={room.state} withToggle label="Show/hide state" initialState={false} />
                <Debug
                    // renderData={() => (
                    //     <span>
                    //         {room.clients.map((player) => (
                    //             <div>
                    //                 <Tooltip key={player.id} hasArrow shouldWrapChildren label={player.id}>
                    //                     <span>{player.username} / </span>
                    //                 </Tooltip>
                    //             </div>
                    //         ))}
                    //     </span>
                    // )}
                    renderData={() => <RoomClientsTable room={room} />}
                    withToggle
                    label="Show/hide names"
                    initialState={Boolean(room.clients.length)}
                />
            </div>
        </Stack>
    );
};

function RoomDetailsControls({ room }) {
    const me = useMyPresence();

    return (
        <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                Actions
            </MenuButton>
            <MenuList>
                {room.isIn ? (
                    <>
                        <MenuItem onClick={() => room.leave()}>Leave</MenuItem>
                        <MenuItem
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
                            Get state
                        </MenuItem>
                        <MenuItem onClick={() => room.broadcast(["demo.broadcast", getRandomString()])}>
                            Broadcast
                        </MenuItem>
                        <MenuItem onClick={() => room.relay(["demo.relay", getRandomString()])}>Relay</MenuItem>
                    </>
                ) : (
                    <MenuItem onClick={() => room.join()}>Join</MenuItem>
                )}
                <MenuItem onClick={() => room.delete()}>Remove</MenuItem>
                {room.clients.some((player) => player.id !== me.id) && (
                    <MenuItem onClick={() => room.kick(room.clients.find((player) => player.id !== me.id).id)}>
                        Kick (not me)
                    </MenuItem>
                )}
            </MenuList>
        </Menu>
    );
}
