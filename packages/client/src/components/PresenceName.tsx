import { isUser } from "@/functions/utils";
import { useLocalPresence } from "@/hooks/usePresence";
import { Player } from "@/types";
import { Editable, EditableInput, EditablePreview, EditableProps } from "@chakra-ui/react";
import { MutableRefObject, useEffect, useRef } from "react";

export const PresenceName = () => {
    const [presence, setPresence] = useLocalPresence();
    const ref = useRef<HTMLSpanElement>();
    const updateName = (username: Player["username"]) => setPresence((player) => ({ ...player, username }));

    // Update preview if another PresenceName triggered an update
    useEffect(() => {
        if (!presence?.username) return;
        ref.current.textContent = presence.username;
    }, [presence]);

    return (
        <EditableName
            inputRef={ref}
            defaultValue={presence?.username || "guest"}
            onSubmit={updateName}
            fontWeight="bold"
            isDisabled={isUser(presence?.username || "")}
        />
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
