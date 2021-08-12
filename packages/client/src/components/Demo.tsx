import { usePresence, useYAwareness, yDoc } from "@/functions/store";
import { getRandomColor, getSaturedColor } from "@/functions/utils";
import { EventPayload, useSocketConnection, useSocketEmit, useSocketEvent } from "@/hooks/useSocketConnection";
import { DemoContext, DemoEvents, getDemoMachine } from "@/machines/demoMachine";
import { Player, Room } from "@/types";
import {
    Box,
    Button,
    Center,
    chakra,
    Editable,
    EditableInput,
    EditablePreview,
    EditableProps,
    SimpleGrid,
    Spinner,
    Stack,
} from "@chakra-ui/react";
import { findBy, getRandomString, removeItemMutate, safeJSONParse, stringify } from "@pastable/core";
import { useMachine } from "@xstate/react";
import { useYArray, useYMap } from "jotai-yjs";
import { useEffect, useState } from "react";
import { snapshot, subscribe, useSnapshot } from "valtio";
import { EventObject, State } from "xstate";

const makeRoom = () => ({ id: getRandomString(), clients: [] });

export const Demo = () => {
    // Connect to websocket / try to reconnect on focus while not connected / debug in dev
    useSocketConnection();

    const [presence, setPresence] = usePresence();
    const updateRandomColor = () => setPresence((player) => ({ ...player, color: getRandomColor() }));

    const rooms = useYArray<Room>(yDoc, "rooms");
    const roomsList = useSnapshot(rooms);

    const createRoom = () => rooms.push(makeRoom());

    const send = useSocketEmit();
    const sendMsg = () => send("yes", getRandomString());

    // const inputRef = useRef<HTMLInputElement>();

    if (!presence) {
        return (
            <Center>
                <Spinner />
            </Center>
        );
    }

    return (
        <Stack w="100%">
            <Center flexDir="column" m="8">
                <Stack h="100%">
                    <Stack direction="row" alignItems="center">
                        <chakra.span>(Editable) Username: </chakra.span>
                        <PresenceName />
                    </Stack>
                    <Button onClick={updateRandomColor}>Random color</Button>
                    <Button onClick={createRoom}>New game</Button>
                    <Button onClick={sendMsg}>Send msg</Button>
                </Stack>
            </Center>
            <SimpleGrid columns={[1, 1, 2, 3, 3, 4]} w="100%" spacing="8">
                {roomsList.map((room, index) => (
                    <GameRoom key={room.id} room={rooms[index]} rooms={rooms} />
                ))}
            </SimpleGrid>
            <PlayerList />
        </Stack>
    );
};

type AnyState = State<any, any, any, any>;
const getStateValuePath = (state: AnyState) => state.toStrings().slice(-1)[0];
const areEqualStateValuePath = (a: AnyState, b: AnyState) => getStateValuePath(a) === getStateValuePath(b);

const GameRoom = ({ room, rooms }: { room: Room; rooms: Array<Room> }) => {
    const snap = useSnapshot(room);
    const [presence] = usePresence();

    const joinRoom = () => room.clients.push(presence);
    const leaveRoom = () => removeItemMutate(room.clients, "id", presence.id);
    const removeRoom = () => removeItemMutate(rooms, "id", room.id);

    const game = useYMap(yDoc, "game." + room.id);
    const store = useYMap(yDoc, "game-machine." + room.id);
    const [initialCtx] = useState(() => ({
        game,
        room,
        getRoomSnap: () => snapshot(room),
        getGameSnap: () => snapshot(game),
    }));
    const initialState = useInitialMachineState<DemoContext, DemoEvents>(store as any, initialCtx);

    const [state, send] = useMachine(() => getDemoMachine(initialCtx), { state: initialState });
    const emit = useSocketEmit();
    const sendAndEmit = (event: EventPayload, emitOnlyOnStateDiff?: boolean) => {
        const nextState = send(event as any);
        if (emitOnlyOnStateDiff && areEqualStateValuePath(state, nextState)) return;

        emit(event);
        store.state = stringify(nextState, 0);
    };

    useEffect(() => {
        console.log("SUBSCRIBE APPLY");
        const unsubRoom = subscribe(room, () => send("APPLY_CTX"));
        const unsubGame = subscribe(game, () => send("APPLY_CTX"));
        send("APPLY_CTX");

        return () => {
            unsubRoom();
            unsubGame();
        };
    }, []);

    const play = () => sendAndEmit("PLAY", true);
    const markAsDone = () => sendAndEmit("MARK_DONE");
    useSocketEvent("PLAY", () => send("PLAY"));

    const applyCtx = () => send("APPLY_CTX");
    console.log(state.context, snapshot(game));

    return (
        <Stack border="1px solid teal">
            <Stack direction="row">
                <span>id: {snap.id}</span>
                <span>state: {getStateValuePath(state)}</span>
                <span>ctx isDone: {state.context.game.mark ? "done" : "empty"}</span>
            </Stack>
            <span>ctx clients: {state.context.room.clients.map((client) => client.username).toString()}</span>
            {state.matches("waiting") &&
                (Boolean(findBy(state.context.room.clients, "id", presence.id)) ? (
                    <Button onClick={leaveRoom}>Leave</Button>
                ) : (
                    <Button onClick={joinRoom}>Join</Button>
                ))}
            <Button onClick={removeRoom}>Remove</Button>
            {state.matches("playing") && <Button onClick={markAsDone}>Mark as done</Button>}
            <Button onClick={play}>Play</Button>
            <Button onClick={applyCtx}>Apply ctx</Button>
        </Stack>
    );
};

const useInitialMachineState = <TC, TE extends EventObject = EventObject>(store: { state: string }, ctx?: TC) => {
    // const [initialState] = useState(() => (store.state ? State.create<TC, TE>(safeJSONParse(store.state)) : undefined));
    const [initialState] = useState(() =>
        store.state
            ? State.create<TC, TE>({
                  ...safeJSONParse(store.state),
                  context: { ...ctx, ...safeJSONParse(store.state).context },
              })
            : undefined
    );

    return initialState;
};

// import * as Y from "yjs";
// function useSyncMachine<
//     TContext,
//     TEvent extends EventObject,
//     TTypestate extends Typestate<TContext> = { value: any; context: TContext }
// >(
//     yDoc: Y.Doc,
//     getMachine: MaybeLazy<StateMachine<TContext, any, TEvent, TTypestate>>,
//     options: Partial<InterpreterOptions> &
//         Partial<UseMachineOptions<TContext, TEvent>> &
//         Partial<MachineOptions<TContext, TEvent>> = {}
// ): [
//     State<TContext, TEvent, any, TTypestate>,
//     Interpreter<TContext, any, TEvent, TTypestate>["send"],
//     Interpreter<TContext, any, TEvent, TTypestate>,
//     SetState<State<TContext, TEvent, any, TTypestate>>,
//     (nextState: State<TContext, TEvent, any, TTypestate>) => void
// ]  {
//     const { game, room} = {} as any
//     const [initialCtx] = useState(() => ({
//         game,
//         room,
//         getRoomSnap: () => snapshot(room),
//         getGameSnap: () => snapshot(game),
//     }));
//     const [storeId] = useState(() => "statemachine." + getRandomString())
//     const store = useYMap(yDoc, storeId);
//     const initialState = useInitialMachineState<DemoContext, DemoEvents>(store as any, initialCtx);

//     const [state, send, service] = useMachine(() => getDemoMachine(initialCtx), { state: initialState });
//     const emit = useSocketEmit();
//     const sendAndEmit = (event: EventPayload, emitOnlyOnStateDiff?: boolean) => {
//         const nextState = send(event as any);
//         if (emitOnlyOnStateDiff && areEqualStateValuePath(state, nextState)) return nextState;

//         emit(event);
//         store.state = stringify(nextState, 0);
//         return nextState
//     };

//     useEffect(() => {
//         console.log("SUBSCRIBE APPLY");
//         const unsubRoom = subscribe(room, () => send("APPLY_CTX"));
//         const unsubGame = subscribe(game, () => send("APPLY_CTX"));
//         send("APPLY_CTX");

//         return () => {
//             unsubRoom();
//             unsubGame();
//         };
//     }, []);

//     return [state, sendAndEmit, service]
// }

const PlayerList = () => {
    const awareness = useYAwareness();
    const players = Array.from(awareness.entries()).filter(([_id, player]) => player.id);

    return (
        <Box pos="fixed" top="100px" right="0">
            <Stack>
                {players.map(([id, presence]) => (
                    <Box key={id} py="2" px="4" w="150px" bgColor={presence.color} pos="relative">
                        <Box
                            pos="absolute"
                            top="0"
                            right="100%"
                            h="100%"
                            w="20px"
                            bgColor={getSaturedColor(presence.color)}
                        />
                        <chakra.span color="black">{presence.username}</chakra.span>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
};

const PresenceName = () => {
    const [presence, setPresence] = usePresence();

    const updateName = (username: Player["username"]) => setPresence((player) => ({ ...player, username }));
    return <EditableName defaultValue={presence.username} onSubmit={updateName} />;
};

const EditableName = (props: EditableProps) => {
    return (
        <Editable {...props}>
            <EditablePreview />
            <EditableInput w="12ch" textAlign="center" />
        </Editable>
    );
};
