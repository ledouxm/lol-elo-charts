import { Layer } from "effect";
import { AppConfigLayer } from "./config.js";

export const AppLayer = Layer.mergeAll(AppConfigLayer);
