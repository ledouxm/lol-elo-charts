import { Layer, ManagedRuntime } from "effect";
import { AppConfigLayer } from "./app.config.ts";
import { makeAppDatabaseLayerFromEnv } from "./db/db.live.ts";
import { HttpServerLive } from "./features/api/api.live.ts";

export const AppLayer = makeAppDatabaseLayerFromEnv.pipe(
    Layer.provideMerge(AppConfigLayer),
    Layer.provideMerge(HttpServerLive)
);

export const AppRuntime = ManagedRuntime.make(AppLayer);
