CREATE TABLE IF NOT EXISTS "request" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now()
);
