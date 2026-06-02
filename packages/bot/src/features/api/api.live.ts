import { HttpApiBuilder, HttpMiddleware, HttpServer } from "@effect/platform";
import { NodeHttpServer } from "@effect/platform-node";
import { Layer } from "effect";
import { createServer } from "node:http";
import { AppApi } from "./api.ts";
import { DuoQLive } from "./duoq.live.ts";

const ApiLive = HttpApiBuilder.api(AppApi).pipe(Layer.provide(DuoQLive));

export const HttpServerLive = HttpApiBuilder.serve(
    (app) => app.pipe(HttpMiddleware.logger, HttpMiddleware.cors())
).pipe(
    Layer.provide(ApiLive),
    Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 }))
);
