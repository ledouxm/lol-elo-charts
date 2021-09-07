import { errorToast, successToast } from "@/functions/toasts";
import { useMyPresence } from "@/hooks/usePresence";
import { useSocketClient } from "@/hooks/useSocketClient";
import { useSocketEventEmitter } from "@/hooks/useSocketConnection";
import { Button, Input, Stack } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";

export const CreateOrJoinGameForm = () => {
    const { register, handleSubmit, getValues, setValue } = useForm({
        defaultValues: { gameId: "oui", type: "create" },
    });
    const setType = (type: "join" | "create") => setValue("type", type);

    const client = useSocketClient();
    const emitter = useSocketEventEmitter();
    const me = useMyPresence();
    const router = useHistory();

    const createGame = ({ gameId }: { gameId: string }) => {
        client.rooms.create(gameId, { initialState: { admin: me.id }, type: "lobby" });

        const off = emitter.on("rooms/exists", (name: string) => {
            errorToast({ title: `Room ${name} already exists` });
        });

        emitter.once("rooms/state#" + gameId, () => {
            router.push("/app/lobby/" + gameId);
            successToast({ title: `Room ${gameId} created` });
            off();
        });
    };

    const joinGame = ({ gameId }: { gameId: string }) => {
        client.rooms.join(gameId);

        const off = emitter.on("rooms/notFound", (name) => errorToast({ title: `Room ${name} not found` }));
        emitter.once("rooms/state#" + gameId, () => {
            router.push("/app/lobby/" + gameId);
            successToast({ title: `Room ${gameId} joined` });
            off();
        });
    };

    const onSubmit = (values: { gameId: string }) =>
        getValues("type") === "join" ? joinGame(values) : createGame(values);

    return (
        <Stack as="form" direction="row" onSubmit={handleSubmit(onSubmit)}>
            <Input type="text" {...register("gameId", { required: true })} />
            <Button type="submit" onClick={() => setType("create")}>
                Create room
            </Button>
            <Button type="submit" onClick={() => setType("join")}>
                Join room
            </Button>
        </Stack>
    );
};
