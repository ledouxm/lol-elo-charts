DO $$ BEGIN
 CREATE TYPE "division" AS ENUM('IV', 'III', 'II', 'I', 'NA');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "tier" AS ENUM('IRON', 'SILVER', 'BRONZE', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER');
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
CREATE TABLE IF NOT EXISTS "bet" (
	"id" serial PRIMARY KEY NOT NULL,
	"gambler_id" integer NOT NULL,
	"summoner_id" varchar(100),
	"points" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"ended_at" timestamp,
	"match_id" varchar(25),
	"has_bet_on_win" boolean,
	"is_win" boolean
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gambler" (
	"id" serial PRIMARY KEY NOT NULL,
	"discord_id" varchar(50),
	"channel_id" varchar(100) NOT NULL,
	"name" text,
	"avatar" varchar(40),
	"created_at" timestamp DEFAULT now(),
	"points" integer DEFAULT 500,
	"last_claim" timestamp DEFAULT now()
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
	"puuid" varchar(100),
	"name" text,
	"id" varchar(100),
	"icon" integer,
	"is_active" boolean DEFAULT true,
	"checked_at" timestamp,
	"channel_id" varchar(100) NOT NULL,
	"last_game_id" varchar(25),
	CONSTRAINT summoner_puuid_channel_id PRIMARY KEY("puuid","channel_id")
);
