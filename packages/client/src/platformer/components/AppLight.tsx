import { PointLightProps } from "@react-three/fiber";
import { useRef } from "react";

export const AppLight = (props: PointLightProps) => {
    const lightRef = useRef();

    return (
        <pointLight
            castShadow
            intensity={0.3}
            position={[-20, 20, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            shadow-mapSize-height={2048}
            shadow-mapSize-width={2048}
            ref={lightRef}
            {...props}
        />
    );
};
