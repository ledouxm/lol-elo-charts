import { State } from "xstate";

export type AnyState = State<any, any, any, any>;
export const getStateValuePath = (state: AnyState) => state.toStrings().slice(-1)[0];
export const parseStateValue = (stateStr: string) => {
    if (!stateStr) return;

    try {
        const parsed = JSON.parse(stateStr);
        return State.create(parsed);
    } catch (error) {
        return;
    }
};
export const areEqualStateValuePath = (a: AnyState, b: AnyState) => getStateValuePath(a) === getStateValuePath(b);
