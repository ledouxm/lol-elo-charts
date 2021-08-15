import { useLocalPresence } from "@/hooks/usePresence";
import { Player } from "@/types";
import { chakra, Editable, EditableInput, EditablePreview, EditableProps, Stack } from "@chakra-ui/react";
import { MutableRefObject, useEffect, useRef } from "react";

export const PresenceName = () => {
    const [presence, setPresence] = useLocalPresence();
    const ref = useRef<HTMLSpanElement>();
    const updateName = (username: Player["username"]) => setPresence((player) => ({ ...player, username }));

    // Update preview if another PresenceName triggered an update
    useEffect(() => {
        ref.current.textContent = presence.username;
    }, [presence]);

    return (
        <Stack direction="row">
            <EditableName
                inputRef={ref}
                defaultValue={presence.username || "guest"}
                onSubmit={updateName}
                fontWeight="bold"
            />
            <chakra.span fontSize="xx-small">({presence.id})</chakra.span>
        </Stack>
    );
};

const EditableName = ({ inputRef, ...props }: EditableProps & { inputRef?: MutableRefObject<HTMLSpanElement> }) => {
    return (
        <Editable {...props}>
            <EditablePreview ref={inputRef} />
            <EditableInput w="12ch" />
        </Editable>
    );
};
