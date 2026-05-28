import { Context, Effect, Layer } from "effect";

export interface DiscordService {
    sendMessage: (channelId: string, content: string) => Effect.Effect<void>;
}

export class Discord extends Context.Tag("Discord")<
    Discord,
    DiscordService
>() {}

export const DiscordLayer = Layer.empty;
