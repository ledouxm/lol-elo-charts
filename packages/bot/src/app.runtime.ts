import { Layer, ManagedRuntime } from "effect";
import { AppConfigLayer } from "./app.config.ts";
import { makeAppDatabaseLayerFromEnv } from "./db/db.live.ts";
import { DotEnvProvider } from "./features/dotenv.runtime.ts";

export const ConfigWithDefaultEnvLayer = AppConfigLayer.pipe(Layer.provide(DotEnvProvider));
export const AppLayer = makeAppDatabaseLayerFromEnv.pipe(Layer.provideMerge(ConfigWithDefaultEnvLayer));

export const AppRuntime = ManagedRuntime.make(AppLayer);
