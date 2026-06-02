import { Layer, ManagedRuntime } from "effect";
import { NodeHttpClient } from "@effect/platform-node";
import { AppConfigLayer } from "./app.config.ts";
import { makeAppDatabaseLayerFromEnv } from "./db/db.ts";
import { RiotClientLive } from "./features/riot-client.ts";

export const AppLayer = makeAppDatabaseLayerFromEnv.pipe(
    Layer.provideMerge(RiotClientLive.pipe(Layer.provide(NodeHttpClient.layer))),
    Layer.provideMerge(AppConfigLayer)
);
export const AppRuntime = ManagedRuntime.make(AppLayer);
