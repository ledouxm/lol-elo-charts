DO $$ BEGIN
 CREATE TYPE "player_of_the_day_type" AS ENUM('winner', 'loser');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "player_of_the_day" (
	"id" serial PRIMARY KEY NOT NULL,
	"summoner_id" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"type" "player_of_the_day_type"
);
