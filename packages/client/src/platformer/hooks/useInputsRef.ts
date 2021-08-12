import { useEffect } from "react";

export const keyDownRef = {
    currents: new Set(),
};
export const keyPressedRef = {
    currents: new Set(),
};

export const useInputsRef = () => {
    useEffect(() => {
        document.onkeydown = (event) => {
            keyDownRef.currents.add(event.code);
        };

        document.onkeypress = (event) => {
            keyPressedRef.currents.add(event.code);
        };

        document.onkeyup = (event) => {
            keyDownRef.currents.delete(event.code);
        };
    }, []);
};
