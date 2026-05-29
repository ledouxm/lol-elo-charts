import { Layer } from "effect";
import { AppConfigLayer } from "./app.config";
import { KyselyLive } from "./db";

export const AppLayer = Layer.mergeAll(AppConfigLayer, KyselyLive);
