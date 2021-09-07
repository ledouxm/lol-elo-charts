import { TextInput } from "@/components/TextInput";
import { useSocketClient } from "@/hooks/useSocketClient";
import { useSocketEvent } from "@/hooks/useSocketConnection";
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
    Wrap,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

export function ManageRolesModal({ isOpen, onClose, userId }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [roles, setRoles] = useState([]);

    const client = useSocketClient();
    useEffect(() => {
        if (!isOpen) return;

        client.once("roles/get#" + userId, setRoles);
        client.roles.get(userId);
    }, [isOpen]);

    useSocketEvent("roles/updated#" + userId, setRoles);

    const addRole = () => {
        client.roles.add(userId, [inputRef.current.value]);
        inputRef.current.value = "";
        inputRef.current.focus();
    };
    const deleteRole = (name: string) => client.roles.delete(userId, [name]);

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Manage roles</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack direction="row" mb="2" alignItems="flex-end">
                            <TextInput label="Add a new role" placeholder="role name" ref={inputRef} />
                            <Button colorScheme="blue" onClick={addRole}>
                                Add
                            </Button>
                        </Stack>
                        {roles.length ? <FormLabel>Roles</FormLabel> : <span>No roles yet</span>}
                        <Wrap>
                            {roles.map((role) => (
                                <RoleTag onCloseClick={() => deleteRole(role)}>{role}</RoleTag>
                            ))}
                        </Wrap>
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
