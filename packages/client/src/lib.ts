import { EventPayload, useSocketEmit } from "@/hooks/useSocketConnection";
import { getRandomString, safeJSONParse, stringify } from "@pastable/core";
import { useMachine } from "@xstate/react";
import { MaybeLazy, UseMachineOptions } from "@xstate/react/lib/types";
import { useYMap } from "jotai-yjs";
import { useEffect, useState } from "react";
import { subscribe } from "valtio";
import { EventObject, Interpreter, InterpreterOptions, MachineOptions, State, StateMachine, Typestate } from "xstate";
import * as Y from "yjs";

export type AnyState = State<any, any, any, any>;
export const getStateValuePath = (state: AnyState) => state.toStrings().slice(-1)[0];
export const areEqualStateValuePath = (a: AnyState, b: AnyState) => getStateValuePath(a) === getStateValuePath(b);

export function useSyncedMachine<
    TContext,
    TEvent extends EventObject,
    TTypestate extends Typestate<TContext> = { value: any; context: TContext }
>(
    getMachine: MaybeLazy<StateMachine<TContext, any, TEvent, TTypestate>>,
    options: Partial<InterpreterOptions> &
        Partial<UseMachineOptions<TContext, TEvent>> &
        Partial<MachineOptions<TContext, TEvent>> &
        UseSyncedMachineOptions
): [
    State<TContext, TEvent, any, TTypestate>,
    Interpreter<TContext, any, TEvent, TTypestate>["send"],
    Interpreter<TContext, any, TEvent, TTypestate>,
    (event: EventPayload, emitOnlyOnStateDiff?: boolean) => State<TContext, TEvent, any, TTypestate>
] {
    const store = useYMap(options.yDoc, options.storeId);
    const initialState = useInitialMachineState<TContext, TEvent>(store as any, options?.context);

    const [state, send, service] = useMachine(getMachine, { state: initialState, context: options?.context });
    const emit = useSocketEmit();
    const sendAndEmit = (event: EventPayload, emitOnlyOnStateDiff?: boolean) => {
        const nextState = send(event as any);
        if (emitOnlyOnStateDiff && areEqualStateValuePath(state, nextState)) return nextState;

        emit(event);
        store.state = stringify(nextState, 0);
        return nextState;
    };

    useEffect(() => {
        const unsubs = options.proxyKeys.map((key) => subscribe(options.context[key], () => send("APPLY_CTX")));
        send("APPLY_CTX");

        return () => unsubs.forEach((unsub) => unsub());
    }, []);

    return [state, send, service, sendAndEmit];
}

export interface UseSyncedMachineOptions {
    yDoc: Y.Doc;
    storeId: string;
    proxyKeys: string[];
}

const useInitialMachineState = <TC, TE extends EventObject = EventObject>(
    store: { state: string },
    ctx?: Partial<TC>
) => {
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
