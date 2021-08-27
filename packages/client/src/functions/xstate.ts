import { State } from "xstate";

export type AnyState = State<any, any, any, any>;
export const getStateValuePath = (state: AnyState) => {
    const paths = state.toStrings();
    const maxNestingLevel = paths
        .map((path) => path.split(".").length + 1)
        .reduce((acc, current) => Math.max(acc, current), 0);
    const finalPaths = paths.filter((path) => path.split(".").length + 1 === maxNestingLevel);

    return finalPaths.length === 1 ? finalPaths[0] : finalPaths.join(" / ");
};
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
