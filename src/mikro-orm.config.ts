import "./envVars";
import { Options } from "@mikro-orm/core";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";

export default {
    type: "postgresql",
    dbName: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    port: Number(process.env.POSTGRES_PORT) || 5432,
    password: process.env.POSTGRES_PASSWORD || "",
    entities: ["./dist/entities/*.js"],
    entitiesTs: ["./src/entities/*.ts"],
    migrations: { path: "./dist/migrations", pathTs: "./src/migrations" },
    metadataProvider: TsMorphMetadataProvider,
} as Options;
