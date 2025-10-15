CREATE TABLE IF NOT EXISTS "summoner_puuid_cache" (
	"puuid" varchar(100) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
