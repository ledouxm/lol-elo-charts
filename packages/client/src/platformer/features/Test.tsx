import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export const Test = ({ name }: { name: string }) => {
    const isDone = useRef(false);
    useTest(name);
    useFrame(() => {
        if (isDone.current) return;
        isDone.current = true;
        console.log(name);
    });

    return null;
};

const useTest = (name: string) => {
    const isDone = useRef(false);

    useFrame(() => {
        if (isDone.current) return;
        isDone.current = true;
        console.log(name + " useTest");
    });
};
