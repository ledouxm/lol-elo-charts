import { ENV } from "@/envVars";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const dbName = process.env.TEST ? "test" : ENV.POSTGRES_DB;

const connectionString = `postgresql://${ENV.POSTGRES_USER}:${ENV.POSTGRES_PASSWORD}@${ENV.POSTGRES_HOST}${
    ENV.POSTGRES_PORT ? ":" + ENV.POSTGRES_PORT : ""
}/${dbName}`;

if (!ENV.POSTGRES_HOST) throw new Error("POSTGRES_HOST not found in environment");

console.log("connecting to", connectionString);

const sql = postgres(connectionString, { max: 1 });
export const db = drizzle(sql);

export const initDb = async () => {
    await migrate(db, { migrationsFolder: "drizzle" });
};
