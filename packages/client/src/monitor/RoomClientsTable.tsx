import { DynamicTable } from "@/components/DynamicTable";
import { DotsIconAction } from "@/components/IconAction";
import { successToast } from "@/functions/toasts";
import { UseRoomStateReturn } from "@/socket/useRoomState";
import { useSocketClient } from "@/socket/useSocketClient";
import { useSocketEventEmitter } from "@/socket/useSocketConnection";
import { Menu, MenuButton, MenuGroup, MenuItem, MenuList, useDisclosure } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { ManageRolesModal } from "./ManageRolesModal";
import { SendCustomEventModal } from "./SendCustomEventModal";

export const RoomClientsTable = ({ room }: { room: UseRoomStateReturn }) => {
    const client = useSocketClient();
    const ids = useMemo(() => room.clientIds, [room.clientIds]);

    // On room.clients change, retrieve presence.meta so we can display client.meta.sessionid
    useEffect(() => {
        room.presences.forEach(({ state, meta }) => {
            if (!Object.keys(state).length) client.presence.get(state.id);
            if (!Object.keys(meta).length) client.presence.getMeta(state.id);
        });
    }, [ids]);

    return <DynamicTable columns={columns} data={room.presences} getCellProps={() => ({ room })} />;
};

// TODO dynamic columns (= display columns for state.XXX.YYY or meta.ZZZ)
const columns = [
    { Header: "username", accessor: "state.username" },
    { Header: "id", accessor: "state.id" },
    { Header: "sessionId", accessor: "meta.sessionId" },
    {
        Header: "",
        accessor: "__actions",
        canBeSorted: false,
        Cell: ({ row, room }) => <ClientActionMenu row={row} room={room} />,
    },
];

const ClientActionMenu = ({ row, room }: { row: any; room: UseRoomStateReturn }) => {
    const client = useSocketClient();
    const userId = row.original.state.id;

    const refresh = () => {
        client.presence.get(userId);
        client.presence.getMeta(userId);
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
        client.emit("dm#" + userId, event);
        onClose();
    };

    const kick = () => room.kick(userId);
    const setAsLobbyAdmin = () => room.update(userId, "admin");

    return (
        <>
            <Menu>
                <MenuButton as={DotsIconAction} />
                <MenuList>
                    <MenuGroup title="Room">
                        <MenuItem onClick={kick}>Kick</MenuItem>
                        <MenuItem onClick={setAsLobbyAdmin}>Set as lobby admin</MenuItem>
                    </MenuGroup>
                    <MenuGroup title="Presence">
                        <MenuItem onClick={() => openModal("event")}>Send custom event</MenuItem>
                        <MenuItem onClick={refresh}>Refresh</MenuItem>
                        <MenuItem onClick={() => openModal("roles")}>Manage roles</MenuItem>
                        <MenuItem onClick={() => openModal("state")}>Manage state/meta</MenuItem>
                    </MenuGroup>
                </MenuList>
            </Menu>
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
};

type ModalType = "event" | "roles" | "state";
