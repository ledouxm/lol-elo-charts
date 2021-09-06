import { DynamicTable } from "@/components/DynamicTable";
import { DotsIconAction } from "@/components/IconAction";
import { UseRoomStateReturn } from "@/hooks/useRoomState";
import { useSocketClient } from "@/hooks/useSocketClient";
import { Menu, MenuButton, MenuGroup, MenuItem, MenuList } from "@chakra-ui/react";
import { useEffect } from "react";

export const RoomClientsTable = ({ room }: { room: UseRoomStateReturn }) => {
    const client = useSocketClient();
    // On room.clients change, retrieve presence.meta so get client.meta.sessionid
    useEffect(() => {
        return; // TODO
        room.clients.forEach((player) => {
            client.presence.get(player.id);
            client.presence.getMeta(player.id);
        });
    }, [room.clients]);

    console.log(room.clients);
    return <DynamicTable columns={columns} data={room.clients} />;
};

// TODO dynamic columns (= display columns for state.XXX.YYY or meta.ZZZ)
const columns = [
    { Header: "username", accessor: "username" },
    { Header: "id", accessor: "id" },
    { Header: "sessionId", accessor: "meta.sessionId" },
    { Header: "", accessor: "__actions", canBeSorted: false, Cell: () => <ClientActionMenu /> },
];

const ClientActionMenu = () => {
    return (
        <Menu>
            <MenuButton as={DotsIconAction} />
            <MenuList>
                <MenuGroup title="Room">
                    <MenuItem onClick={() => {}}>Kick</MenuItem>
                    <MenuItem onClick={() => {}}>Set as lobby admin</MenuItem>
                </MenuGroup>
                <MenuGroup title="Presence">
                    {/* TODO https://github.com/constantoduol/JSONEditor ? */}
                    <MenuItem onClick={() => {}}>Send custom event</MenuItem>
                    <MenuItem onClick={() => {}}>Manage roles</MenuItem>
                    <MenuItem onClick={() => {}}>Manage state/meta</MenuItem>
                </MenuGroup>
            </MenuList>
        </Menu>
    );
};
