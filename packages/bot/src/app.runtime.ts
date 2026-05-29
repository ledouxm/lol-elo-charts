import { Layer, ManagedRuntime } from "effect";
import { AppConfigLayer } from "./app.config.ts";
import { makeAppDatabaseLayerFromEnv } from "./db/db.live.ts";

export const AppLayer = makeAppDatabaseLayerFromEnv.pipe(Layer.provideMerge(AppConfigLayer));

export const AppRuntime = ManagedRuntime.make(AppLayer);
