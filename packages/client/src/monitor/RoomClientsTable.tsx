import { DynamicTable } from "@/components/DynamicTable";
import { DotsIconAction } from "@/components/IconAction";
import { successToast } from "@/functions/toasts";
import { UseRoomStateReturn } from "@/hooks/useRoomState";
import { useSocketClient } from "@/hooks/useSocketClient";
import { useSocketEventEmitter } from "@/hooks/useSocketConnection";
import { Menu, MenuButton, MenuGroup, MenuItem, MenuList, useDisclosure } from "@chakra-ui/react";
import { useEffect, useMemo } from "react";
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

    return <DynamicTable columns={columns} data={room.presences} />;
};

// TODO dynamic columns (= display columns for state.XXX.YYY or meta.ZZZ)
const columns = [
    { Header: "username", accessor: "state.username" },
    { Header: "id", accessor: "state.id" },
    { Header: "sessionId", accessor: "meta.sessionId" },
    { Header: "", accessor: "__actions", canBeSorted: false, Cell: ({ row }) => <ClientActionMenu row={row} /> },
];

const ClientActionMenu = ({ row }) => {
    const client = useSocketClient();
    const userId = row.original.state.id;

    const refresh = () => {
        client.presence.get(userId);
        client.presence.getMeta(userId);
    };

    const { isOpen, onOpen, onClose } = useDisclosure();
    const emitter = useSocketEventEmitter();
    const onSubmitCustomEvent = (event) => {
        emitter.once(event[0], () => successToast({ title: `Sent ${event[0]} !` }));
        client.emit("dm#" + userId, event);
        onClose();
    };

    return (
        <>
            <Menu>
                <MenuButton as={DotsIconAction} />
                <MenuList>
                    <MenuGroup title="Room">
                        <MenuItem onClick={() => {}}>Kick</MenuItem>
                        <MenuItem onClick={() => {}}>Set as lobby admin</MenuItem>
                    </MenuGroup>
                    <MenuGroup title="Presence">
                        <MenuItem onClick={onOpen}>Send custom event</MenuItem>
                        <MenuItem onClick={refresh}>Refresh</MenuItem>
                        <MenuItem onClick={() => {}}>Manage roles</MenuItem>
                        <MenuItem onClick={() => {}}>Manage state/meta</MenuItem>
                    </MenuGroup>
                </MenuList>
            </Menu>
            <SendCustomEventModal isOpen={isOpen} onClose={onClose} onSubmit={onSubmitCustomEvent} />
        </>
    );
};
