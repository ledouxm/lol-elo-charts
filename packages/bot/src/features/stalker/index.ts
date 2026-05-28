import { Context, Layer } from "effect";

export interface StalkerService {
    start: () => void;
}

export class Stalker extends Context.Tag("Stalker")<
    Stalker,
    StalkerService
>() {}

export const StalkerLayer = Layer.empty;
