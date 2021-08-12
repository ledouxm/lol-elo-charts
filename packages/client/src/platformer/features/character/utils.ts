import { Vector3 } from "three";

export const calculateForce = (angle: number, speed: number, dest: number[] = [-1, 0, 0]) => {
    const force = new Vector3(...dest).multiplyScalar(speed);
    const axis = new Vector3(0, 1, 0);

    force.applyAxisAngle(axis, angle);
    return force;
};
