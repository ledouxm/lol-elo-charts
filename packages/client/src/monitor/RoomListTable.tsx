import { Box, Flex, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { GoTriangleUp } from "react-icons/go";
import { MdDetails } from "react-icons/md";

import { DynamicTable } from "@/components/DynamicTable";
import { DotsIconAction, IconAction } from "@/components/IconAction";
import { LobbyRoomState } from "@/room/LobbyRoom";
import { useRoomList, useRoomState } from "@/socket/useRoomState";

import { RoomClientsTable } from "./ClientsTable";
import { JsonEditor } from "./JsonEditor";

export const RoomListTable = () => {
    const roomList = useRoomList();

    return (
        <DynamicTable
            columns={columns}
            data={roomList}
            getCellProps={(_cell, rowIndex) => ({ room: roomList[rowIndex] })}
            renderSubRow={({ row }) => <RoomExpandedRow name={roomList[row.index].name} />}
        />
    );
};

const columns = [
    { Header: "name", accessor: "name" },
    {
        Header: "clients",
        id: "clients",
        accessor: (room) => room.clients.length,
        Cell: ({ room }) => room.clients.map((id) => id).toString(),
    },
    { Header: "clients count", id: "clients.length", accessor: (room) => room.clients.length },
    {
        Header: "",
        accessor: "__actions",
        canBeSorted: false,
        Cell: ({ row, room }) => (room.name ? <RoomActionMenu row={row} name={room.name} /> : null),
    },
];

export const observedRoomNameAtom = atom("");
const RoomActionMenu = ({ row, name }) => {
    const room = useRoomState<LobbyRoomState>(name);
    const [observedRoomName, setObservedRoomName] = useAtom(observedRoomNameAtom);
    const observe = () => {
        setObservedRoomName(room.name);
        room.watch();
        room.ref.current.watchers = (room.ref.current.watchers || []).concat(["playerList"]);
    };
    const unobserve = () => {
        setObservedRoomName("");
        room.ref.current.watchers = (room.ref.current.watchers || []).filter((item) => item !== "playerList");
        if (!room.ref.current.watchers?.length) room.unwatch();
    };

    return (
        <Flex>
            <IconAction
                {...row.getToggleRowExpandedProps()}
                icon={row.isExpanded ? GoTriangleUp : MdDetails}
                label="Expand"
                mr="2"
            />
            <IconAction
                icon={observedRoomName === room.name ? AiFillEyeInvisible : AiFillEye}
                onClick={observedRoomName === room.name ? unobserve : observe}
                label="Observe"
                mr="2"
            />
            <Menu>
                <MenuButton as={DotsIconAction} />
                <MenuList>
                    {room.isIn ? (
                        <MenuItem onClick={room.leave}>Leave</MenuItem>
                    ) : (
                        <MenuItem onClick={room.join}>Join</MenuItem>
                    )}
                    {/* Modal + JSON editor */}
                    <MenuItem onClick={() => {}}>Relay event</MenuItem>
                    <MenuItem onClick={room.get}>Refresh</MenuItem>
                    <MenuItem onClick={room.delete}>Remove</MenuItem>
                </MenuList>
            </Menu>
        </Flex>
    );
};

const RoomExpandedRow = ({ name }) => {
    const room = useRoomState<LobbyRoomState>(name);

    // Get updates without joining the room
    useEffect(() => {
        room.watch();
        room.ref.current.watchers = (room.ref.current.watchers || []).concat(["expandedRow"]);

        return () => {
            room.ref.current.watchers = (room.ref.current.watchers || []).filter((item) => item !== "expandedRow");
            if (!room.ref.current.watchers?.length) room.unwatch();
        };
    }, []);

    return (
        <Box>
            <Tabs>
                <TabList>
                    <Tab>Clients</Tab>
                    <Tab isDisabled={!Object.keys(room.state).length}>State</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <RoomClientsTable room={room} />
                    </TabPanel>
                    <TabPanel>
                        <JsonEditor value={room.state} mode="view" />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};
