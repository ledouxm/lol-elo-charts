import { Config, Effect } from "effect";

export const AppConfig = Effect.gen(function* () {
    const discordToken = yield* Config.string("DISCORD_TOKEN");
    const databaseUrl = yield* Config.string("DATABASE_URL");

    return { discordToken, databaseUrl };
});
