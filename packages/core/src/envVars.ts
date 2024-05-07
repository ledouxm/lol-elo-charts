import dotenv from "dotenv";
import { z } from "zod";
dotenv.config({ path: "../../.env" });

const stringOrNumberAsNumber = z.string().or(z.number()).transform(Number);
const stringOrBooleanAsBoolean = z
    .string()
    .or(z.boolean())
    .transform((v) => v.toString() === "true");

const envSchema = z.object({
    NODE_ENV: z.string().default("development"),
    HTTP_PORT: stringOrNumberAsNumber.default(3000),
    ENABLE_BETS: stringOrBooleanAsBoolean.default(false),
    FORCE_RECAPS: stringOrBooleanAsBoolean.default(false),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_HOST: z.string(),
    POSTGRES_PORT: stringOrNumberAsNumber.optional(),
    POSTGRES_DB: z.string(),
    BOT_TOKEN: z.string(),
    RG_API_KEY: z.string(),

    CRON_BETS_DELAY_MIN: stringOrNumberAsNumber.default(5),

    DISCORD_NOTIFICATION_INTERVAL_SEC: stringOrNumberAsNumber.default(120),
    PLAYER_REQUEST_INTERVAL_SEC: stringOrNumberAsNumber.default(5),

    VALORANT_DISCORD_NOTIFICATION_INTERVAL_SEC: stringOrNumberAsNumber.default(120),
    VALORANT_PLAYER_REQUEST_INTERVAL_SEC: stringOrNumberAsNumber.default(5),
    VALORANT_API_KEY: z.string(),

    ARENA_COMMANDS_ENABLED: stringOrBooleanAsBoolean.default(false),
    ARENA_ENABLED: stringOrBooleanAsBoolean.default(false),
    DEBUG: z.string().default("elo-stalker*"),
});

export const ENV = envSchema.parse(process.env);
export const isDev = ENV.NODE_ENV === "development";
