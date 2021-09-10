import { Flex, Menu, MenuButton, MenuGroup, MenuItem, MenuList, useDisclosure } from "@chakra-ui/react";
import { useState } from "react";
import { BiRefresh } from "react-icons/bi";
import { GoTriangleUp } from "react-icons/go";
import { MdDetails } from "react-icons/md";

import { DotsIconAction, IconAction } from "@/components/IconAction";
import { successToast } from "@/functions/toasts";
import { UseRoomStateReturn } from "@/socket/useRoomState";
import { useSocketClient } from "@/socket/useSocketClient";
import { useSocketEventEmitter } from "@/socket/useSocketConnection";

import { ManageRolesModal } from "./ManageRolesModal";
import { SendCustomEventModal } from "./SendCustomEventModal";

export function ClientActionMenu({ row, room }: { row: any; room?: UseRoomStateReturn }) {
    const wsClient = useSocketClient();
    console.log(row.original);
    const userId = row.original.state.id;

    const refresh = () => {
        wsClient.presence.get(userId);
        wsClient.presence.getMeta(userId);
    };

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [openedModal, setOpenedModal] = useState<ModalType>(null);
    const openModal = (name: ModalType) => {
        setOpenedModal(name);
        onOpen();
    };

    const emitter = useSocketEventEmitter();
    const onSubmitCustomEvent = (event) => {
        emitter.once(event[0], () => successToast({ title: `Sent ${event[0]} !` }));
        wsClient.emit("dm#" + userId, event);
        onClose();
    };

    const kick = () => room.kick(userId);
    const setAsLobbyAdmin = () => room.update(userId, "admin");

    const presenceMenu = (
        <>
            <MenuItem onClick={() => openModal("event")}>Send custom event</MenuItem>
            <MenuItem onClick={() => openModal("roles")}>Manage roles</MenuItem>
        </>
    );

    return (
        <>
            <Flex>
                <IconAction
                    {...row.getToggleRowExpandedProps()}
                    icon={row.isExpanded ? GoTriangleUp : MdDetails}
                    label="Expand"
                    mr="2"
                />
                <IconAction onClick={refresh} icon={BiRefresh} label="Refresh" mr="2" />
                <Menu>
                    <MenuButton as={DotsIconAction} />
                    <MenuList>
                        {room ? (
                            <>
                                <MenuGroup title="Room">
                                    <MenuItem onClick={kick}>Kick</MenuItem>
                                    <MenuItem onClick={setAsLobbyAdmin} isDisabled={room.state.admin === userId}>
                                        Set as lobby admin
                                    </MenuItem>
                                </MenuGroup>
                                <MenuGroup title="Presence">{presenceMenu}</MenuGroup>
                            </>
                        ) : (
                            presenceMenu
                        )}
                    </MenuList>
                </Menu>
            </Flex>
            <SendCustomEventModal
                isOpen={isOpen && openedModal === "event"}
                onClose={onClose}
                onSubmit={onSubmitCustomEvent}
            />
            <ManageRolesModal
                isOpen={isOpen && openedModal === "roles"}
                onClose={onClose}
                userId={userId}
                room={room}
            />
        </>
    );
}
type ModalType = "event" | "roles";
