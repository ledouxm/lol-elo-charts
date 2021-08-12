import { useEffect, useRef } from "react";

export type MouseMovements = [x: number, y: number];

export const useMouseMovements = () => {
    const mouseMovementRef = useRef([0, 0]);

    useEffect(() => {
        const callback = (event) => {
            mouseMovementRef.current[0] += event.movementX;
            mouseMovementRef.current[1] += event.movementY;
        };
        document.body.addEventListener("mousemove", callback);

        return () => document.body.removeEventListener("mousemove", callback);
    }, []);

    return mouseMovementRef;
};
