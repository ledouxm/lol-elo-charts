import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const connectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;
if (!process.env.POSTGRES_HOST) throw new Error("POSTGRES_HOST not found in environment");

const sql = postgres(connectionString, { max: 1 });
export const db = drizzle(sql);

export const initDb = async () => {
    await migrate(db, { migrationsFolder: "drizzle" });
};
