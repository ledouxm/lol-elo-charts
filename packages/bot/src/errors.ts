import { Data } from "effect";

export class RiotApiError extends Data.TaggedError("RiotApiError")<{
    message: string;
    status?: number;
}> {}

export class ValorantApiError extends Data.TaggedError("ValorantApiError")<{
    message: string;
    status?: number;
}> {}

export class DbError extends Data.TaggedError("DbError")<{
    message: string;
    cause?: unknown;
}> {}

export class DiscordError extends Data.TaggedError("DiscordError")<{
    message: string;
    cause?: unknown;
}> {}
