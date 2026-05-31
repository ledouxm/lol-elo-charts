import { HttpApiBuilder } from "@effect/platform";
import { Effect } from "effect";
import { AppApi } from "./api.ts";

export const DuoQLive = HttpApiBuilder.group(AppApi, "duoq", (handlers) =>
    handlers
        .handle("duoq", (_) =>
            Effect.gen(function* () {
                return {} as any;
            })
        )
        .handle("duoqMatches", (_) =>
            Effect.gen(function* () {
                return {} as any;
            })
        )
);
