import { PlatformConfigProvider } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { Layer, Logger, LogLevel, ManagedRuntime } from "effect";
import path from "node:path";

const __dirname = new URL(".", import.meta.url).pathname;
const envFilePath = path.resolve(path.join(__dirname, "../.env"));

export const DotEnvProvider = Layer.mergeAll(PlatformConfigProvider.layerDotEnvAdd(envFilePath)).pipe(
    Layer.provideMerge(NodeContext.layer)
);

// export const DotenvRuntime = ManagedRuntime.make(
//     DotEnvProvider.pipe(
//         Layer.provide(Logger.minimumLogLevel(LogLevel.All)),
//         // TODO https://effect.website/blog/releases/effect/313/#effectwhenloglevel
//         Layer.provide(Logger.pretty)
//     )
// );
