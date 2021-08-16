import { errorToast, successToast } from "@/functions/toasts";
import { useMyPresence } from "@/hooks/usePresence";
import { useSocketClient } from "@/hooks/useSocketClient";
import { useSocketEventEmitter } from "@/hooks/useSocketConnection";
import { Stack, Input, Button } from "@chakra-ui/react";
import { useUpdateAtom } from "jotai/utils";
import { useForm } from "react-hook-form";
import { roomNameAtom } from "./RoomPage";

export const CreateGameForm = () => {
    const { register, handleSubmit } = useForm();
    const setRoomName = useUpdateAtom(roomNameAtom);
    const me = useMyPresence();

    const client = useSocketClient();
    const emitter = useSocketEventEmitter();

    const submit = ({ gameId }: { gameId: string }) => {
        client.rooms.create(gameId, { initialState: { admin: me.id }, type: "lobby" });

        const unsub = emitter.on("rooms/exists", (name: string) => {
            errorToast({ title: `Room ${name} already exists` });
        });

        emitter.once("rooms/state#" + gameId, () => {
            setRoomName(gameId);
            successToast({ title: `Room ${gameId} created` });
            unsub();
        });
    };

    return (
        <form onSubmit={handleSubmit(submit)}>
            <Stack>
                <Input type="text" {...register("gameId", { required: true })} />
                <Button type="submit">Create room</Button>
            </Stack>
        </form>
    );
};

export const JoinGameForm = () => {
    const { register, handleSubmit } = useForm();
    const setRoomName = useUpdateAtom(roomNameAtom);

    const client = useSocketClient();
    const emitter = useSocketEventEmitter();

    const submit = ({ gameId }: { gameId: string }) => {
        client.rooms.join(gameId);

        const unsub = emitter.on("rooms/notFound", (name: string) => {
            errorToast({ title: `Room ${name} not found` });
        });

        emitter.once("rooms/state#" + gameId, () => {
            setRoomName(gameId);
            successToast({ title: `Room ${gameId} joined` });
            unsub();
        });
    };

    return (
        <form onSubmit={handleSubmit(submit)}>
            <Stack>
                <Input type="text" {...register("gameId", { required: true })} />
                <Button type="submit">Join room</Button>
            </Stack>
        </form>
    );
};
