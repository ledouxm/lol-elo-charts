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
} from "@chakra-ui/react";
import { useRef, useState } from "react";

import { TextInput } from "@/components/TextInput";

import { JsonEditor } from "./JsonEditor";

export function SendCustomEventModal({ isOpen, onClose, onSubmit }) {
    const [json, setJson] = useState({ nb: 123, str: "aaa", arr: [111, 222], nested: { obj: "obj" } });
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Send custom event</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <TextInput label="Event name" ref={inputRef} mb="2" />
                        <FormLabel>Payload</FormLabel>
                        <JsonEditor value={json} onChange={setJson} />
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={() => onSubmit([inputRef.current.value, json])}>
                            Send
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
