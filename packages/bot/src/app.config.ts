import { Config, Context, Effect, Layer, Option, Redacted } from "effect";
import { RedactedTypeId } from "effect/Redacted";
import { DotEnvProvider } from "./features/dotenv.runtime.ts";

export class AppConfig extends Context.Tag("AppConfig")<
    AppConfig,
    {
        nodeEnv: string;
        httpPort: number;
        db: {
            user: string;
            password: Redacted.Redacted<string>;
            host: string;
            port: number | undefined;
            name: string;
            url: Redacted.Redacted<string>;
        };
        discord: {
            botToken: Redacted.Redacted<string>;
            notificationIntervalSec: number;
        };
        riot: {
            apiKey: Redacted.Redacted<string>;
            playerRequestIntervalSec: number;
        };
        valorant: {
            apiKey: Redacted.Redacted<string>;
            notificationIntervalSec: number;
            playerRequestIntervalSec: number;
        };
        features: {
            enableBets: boolean;
            forceRecaps: boolean;
            arenaCommandsEnabled: boolean;
            arenaEnabled: boolean;
            arenaNotificationEnabled: boolean;
        };
        cron: {
            betsDelayMin: number;
        };
        debug: string;
    }
>() {}

export const AppConfigLayer = Layer.effect(
    AppConfig,
    Effect.gen(function* () {
        const nodeEnv = yield* Config.string("NODE_ENV").pipe(Config.withDefault("development"));
        const httpPort = yield* Config.number("HTTP_PORT").pipe(Config.withDefault(3000));
        const debug = yield* Config.string("DEBUG").pipe(Config.withDefault("elo-stalker*"));

        const dbUser = yield* Config.string("POSTGRES_USER");
        const dbPassword = yield* Config.string("POSTGRES_PASSWORD");
        const dbHost = yield* Config.string("POSTGRES_HOST");

        console.log("Database config:", {
            dbUser,
            dbPassword: dbPassword,
            dbHost,
        });
        const dbPort = yield* Config.number("POSTGRES_PORT").pipe(Config.option);
        const dbName = yield* Config.string("POSTGRES_DB");
        const dbUrl = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${Option.getOrUndefined(dbPort) ?? 5432}/${dbName}`;

        const botToken = yield* Config.string("BOT_TOKEN");
        const discordNotificationIntervalSec = yield* Config.number("DISCORD_NOTIFICATION_INTERVAL_SEC").pipe(
            Config.withDefault(120)
        );

        const rgApiKey = yield* Config.string("RG_API_KEY");
        const playerRequestIntervalSec = yield* Config.number("PLAYER_REQUEST_INTERVAL_SEC").pipe(
            Config.withDefault(5)
        );

        const valorantApiKey = yield* Config.string("VALORANT_API_KEY");
        const valorantNotificationIntervalSec = yield* Config.number("VALORANT_DISCORD_NOTIFICATION_INTERVAL_SEC").pipe(
            Config.withDefault(120)
        );
        const valorantPlayerRequestIntervalSec = yield* Config.number("VALORANT_PLAYER_REQUEST_INTERVAL_SEC").pipe(
            Config.withDefault(5)
        );

        const enableBets = yield* Config.boolean("ENABLE_BETS").pipe(Config.withDefault(false));
        const forceRecaps = yield* Config.boolean("FORCE_RECAPS").pipe(Config.withDefault(false));
        const arenaCommandsEnabled = yield* Config.boolean("ARENA_COMMANDS_ENABLED").pipe(Config.withDefault(false));
        const arenaEnabled = yield* Config.boolean("ARENA_ENABLED").pipe(Config.withDefault(false));
        const arenaNotificationEnabled = yield* Config.boolean("ARENA_NOTIFICATION_ENABLED").pipe(
            Config.withDefault(false)
        );

        const betsDelayMin = yield* Config.number("CRON_BETS_DELAY_MIN").pipe(Config.withDefault(5));

        return {
            nodeEnv,
            httpPort,
            debug,
            db: {
                user: dbUser,
                password: Redacted.make(dbPassword),
                host: dbHost,
                port: Option.getOrUndefined(dbPort),
                name: dbName,
                url: Redacted.make(dbUrl),
            },
            discord: { botToken: Redacted.make(botToken), notificationIntervalSec: discordNotificationIntervalSec },
            riot: { apiKey: Redacted.make(rgApiKey), playerRequestIntervalSec },
            valorant: {
                apiKey: Redacted.make(valorantApiKey),
                notificationIntervalSec: valorantNotificationIntervalSec,
                playerRequestIntervalSec: valorantPlayerRequestIntervalSec,
            },
            features: {
                enableBets,
                forceRecaps,
                arenaCommandsEnabled,
                arenaEnabled,
                arenaNotificationEnabled,
            },
            cron: { betsDelayMin },
        };
    })
);
