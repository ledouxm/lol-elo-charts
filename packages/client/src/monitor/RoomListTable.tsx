import { DynamicTable } from "@/components/DynamicTable";
import { DotsIconAction, IconAction } from "@/components/IconAction";
import { useRoomList, useRoomState } from "@/socket/useRoomState";
import { LobbyRoomState } from "@/room/LobbyRoom";
import { Box, Button, Flex, Menu, MenuButton, MenuItem, MenuList, useDisclosure } from "@chakra-ui/react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { MdDetails } from "react-icons/md";
import { GoTriangleUp } from "react-icons/go";
import { JSONViewer } from "react-json-editor-viewer";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { RoomClientsTable } from "./RoomClientsTable";
import { atom, useAtom } from "jotai";

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
                        <JSONViewer data={room.state} collapsible />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};

const editorStyles = { root: { color: "white" } };

function RoomModalInspectState() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Modal Title</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>{/* <Lorem count={2} /> */}</ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button variant="ghost">Secondary Action</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}

// - inspect -> opens a details page/box where we can see :
// ---- room.state/meta
// ---- edit form with custom state depending on type (lobby = LobbyState) with json editor or even more specific ?
// ---- each client state/meta & same actions as presence table + "set room role" = prefilled role for this room
