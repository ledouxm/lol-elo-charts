const { TsMorphMetadataProvider } = require("@mikro-orm/reflection");

module.exports = {
    type: "postgresql",
    dbName: process.env.POSTGRES_DB || "backend-with-ci",
    host: process.env.POSTGRES_HOST || "127.0.0.1",
    user: process.env.POSTGRES_USER || "postgres",
    port: Number(process.env.POSTGRES_PORT) || 5432,
    password: process.env.POSTGRES_PASSWORD || "",
    entities: ["./dist/entities"],
    entitiesTs: ["./src/entities"],
    metadataProvider: TsMorphMetadataProvider,
};
