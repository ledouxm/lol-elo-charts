CREATE TABLE IF NOT EXISTS "match" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" varchar(25) NOT NULL,
	"summoner_id" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"started_at" timestamp,
	"ended_at" timestamp,
	"is_win" boolean
);
