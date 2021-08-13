import { debug } from "debug";

export const makeDebug = (suffix: string) => debug("multi").extend(suffix);
