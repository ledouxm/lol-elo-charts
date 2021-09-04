import { DynamicTable } from "@/components/DynamicTable";
import { DotsIconAction, IconAction } from "@/components/IconAction";
import { useRoomList, useRoomState } from "@/hooks/useRoomState";
import { LobbyRoomState } from "@/room/LobbyRoom";
import { ChevronDownIcon } from "@chakra-ui/icons";
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
import { JSONEditor, JSONViewer } from "react-json-editor-viewer";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { RoomClientsTable } from "./RoomClientsTable";

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
        Cell: ({ row, room }) => <RoomActionMenu row={row} name={room.name} />,
    },
];

const RoomActionMenu = ({ row, name }) => {
    const room = useRoomState<LobbyRoomState>(name);

    return (
        <Flex>
            <IconAction
                {...row.getToggleRowExpandedProps()}
                icon={row.isExpanded ? AiFillEyeInvisible : AiFillEye}
                label="Inspect"
                mr="2"
            />
            <Menu>
                <MenuButton as={DotsIconAction} />
                <MenuList>
                    {/* Modal + JSON editor */}
                    <MenuItem onClick={() => {}}>Relay event</MenuItem>
                    {room.isIn ? (
                        <MenuItem onClick={room.leave}>Leave</MenuItem>
                    ) : (
                        <MenuItem onClick={room.join}>Join</MenuItem>
                    )}
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
        return room.unwatch;
    }, []);

    // console.log(room);
    return (
        <Box>
            <Tabs>
                <TabList>
                    <Tab>State</Tab>
                    <Tab>Clients</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <JSONViewer data={room.state} collapsible />
                    </TabPanel>
                    <TabPanel>
                        <RoomClientsTable room={room} />
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
