DO $$ BEGIN
 CREATE TYPE "division" AS ENUM('IV', 'III', 'II', 'I', 'NA');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "tier" AS ENUM('IRON', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apex" (
	"id" serial PRIMARY KEY NOT NULL,
	"master" integer,
	"grandmaster" integer,
	"challenger" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rank" (
	"id" serial PRIMARY KEY NOT NULL,
	"summoner_id" varchar(100) NOT NULL,
	"tier" "tier",
	"division" "division",
	"league_points" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "summoner" (
	"puuid" varchar(100) PRIMARY KEY NOT NULL,
	"name" text,
	"id" varchar(100),
	"icon" integer,
	"is_active" boolean DEFAULT true,
	"checked_at" timestamp,
	"channel_id" varchar(100) NOT NULL
);
