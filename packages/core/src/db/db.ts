import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const dbName = process.env.TEST ? "test" : process.env.POSTGRES_DB;

const connectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${
    process.env.POSTGRES_HOST
}${process.env.POSTGRES_PORT ? ":" + process.env.POSTGRES_PORT : ""}/${dbName}`;

if (!process.env.POSTGRES_HOST) throw new Error("POSTGRES_HOST not found in environment");

console.log("connecting to", connectionString);

const sql = postgres(connectionString, { max: 1 });
export const db = drizzle(sql);

export const initDb = async () => {
    await migrate(db, { migrationsFolder: "drizzle" });
};
