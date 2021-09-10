import {
    Button,
    FormLabel,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
    Tag,
    TagCloseButton,
    TagLabel,
    UseDisclosureReturn,
    Wrap,
    chakra,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "react-query";

import { api } from "@/api";
import { TextInput } from "@/components/TextInput";
import { errorToast, successToast } from "@/functions/toasts";
import { isGuest } from "@/functions/utils";
import { UseRoomStateReturn } from "@/socket/useRoomState";
import { useSocketClient } from "@/socket/useSocketClient";
import { useSocketEvent } from "@/socket/useSocketConnection";
import { Player } from "@/types";

const addGlobalRole = (roles: Array<string>) => api.post("/roles/add", { roles });
const deleteGlobalRole = (roles: Array<string>) => api.post("/roles/delete", { roles });

export function ManageRolesModal({
    isOpen,
    onClose,
    userId,
    room,
}: Pick<UseDisclosureReturn, "isOpen" | "onClose"> & { userId?: Player["id"]; room?: UseRoomStateReturn }) {
    const globalInputRef = useRef<HTMLInputElement>(null);
    const roomInputRef = useRef<HTMLInputElement>(null);
    const [roles, setRoles] = useState([]);

    const client = useSocketClient();
    /** Get current roles */
    useEffect(() => {
        if (!isOpen) return;

        client.once("roles/get#" + userId, setRoles);
        client.roles.get(userId);
    }, [isOpen]);

    useSocketEvent("roles/updated#" + userId, setRoles);

    const queryOptions: any = { onSuccess: () => successToast({ title: "Success" }), onError: () => errorToast() };
    const addMutation = useMutation(() => addGlobalRole([globalInputRef.current.value]), queryOptions);
    const deleteMutation = useMutation(() => deleteGlobalRole([globalInputRef.current.value]), queryOptions);

    const resetInput = (ref) => {
        ref.current.value = "";
        ref.current.focus();
    };
    const addRole = () => {
        addMutation.mutate();
        setTimeout(() => resetInput(globalInputRef), 0);
    };
    const addRoomRole = () => {
        client.rooms.addRole(room.name, userId, roomInputRef.current.value);
        client.once("roles/updated#" + userId, () => successToast({ title: "Success" }));
        resetInput(roomInputRef);
    };
    const deleteRole = (name: string) => {
        if (name.startsWith("global")) {
            deleteMutation.mutate();
        } else {
            client.once("roles/updated#" + userId, () => successToast({ title: "Success" }));
            client.roles.delete(userId, name);
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Manage roles</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack>
                            <Stack direction="row" alignItems="flex-end" display={isGuest(userId) ? "none" : ""}>
                                <TextInput
                                    label="Add a new global role"
                                    placeholder="global role name"
                                    ref={globalInputRef}
                                />
                                <Button colorScheme="blue" onClick={addRole}>
                                    Add
                                </Button>
                            </Stack>
                            {room && (
                                <Stack direction="row" alignItems="flex-end">
                                    <TextInput
                                        label="Add a new room role name"
                                        placeholder={`just fill name: rooms.${room.name}.\${name}`}
                                        ref={roomInputRef}
                                    />
                                    <Button colorScheme="blue" onClick={addRoomRole}>
                                        Add
                                    </Button>
                                </Stack>
                            )}
                        </Stack>
                        <chakra.div mt="2">
                            {roles.length ? <FormLabel>Roles</FormLabel> : <span>No roles yet</span>}
                            <Wrap>
                                {roles.map((role) => (
                                    <RoleTag key={role} onCloseClick={() => deleteRole(role)}>
                                        {role}
                                    </RoleTag>
                                ))}
                            </Wrap>
                        </chakra.div>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}

const RoleTag = ({ children, onCloseClick }) => (
    <Tag size="lg" borderRadius="full" variant="solid" colorScheme="green">
        <TagLabel>{children}</TagLabel>
        <TagCloseButton onClick={onCloseClick} />
    </Tag>
);
