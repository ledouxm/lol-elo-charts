DO $$ BEGIN
 CREATE TYPE "division" AS ENUM('IV', 'III', 'II', 'I', 'NA');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "player_of_the_day_type" AS ENUM('winner', 'loser');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "tier" AS ENUM('IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER');
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
CREATE TABLE IF NOT EXISTS "arena_match" (
	"match_id" varchar(25) PRIMARY KEY NOT NULL,
	"ended_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "arena_player" (
	"puuid" varchar(100),
	"name" text,
	"placement" integer,
	"champion" text,
	"match_id" varchar(25) NOT NULL,
	CONSTRAINT arena_player_puuid_match_id PRIMARY KEY("puuid","match_id")
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
	"is_win" boolean,
	"odds" numeric(4, 2)
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
	"last_claim" timestamp DEFAULT now(),
	"last_beg" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lol_participant" (
	"match_id" varchar(25) NOT NULL,
	"puuid" varchar(100) NOT NULL,
	"win" boolean NOT NULL,
	CONSTRAINT lol_participant_match_id_puuid PRIMARY KEY("match_id","puuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "match" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" varchar(25) NOT NULL,
	"summoner_id" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"participant_index" integer,
	"started_at" timestamp,
	"ended_at" timestamp,
	"is_win" boolean,
	"champion_name" text,
	"kda" varchar(20),
	"details" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "player_of_the_day" (
	"id" serial PRIMARY KEY NOT NULL,
	"summoner_id" varchar(100) NOT NULL,
	"channel_id" varchar(100) NOT NULL,
	"created_at" date DEFAULT now(),
	"type" "player_of_the_day_type"
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
CREATE TABLE IF NOT EXISTS "request" (
	"id" serial PRIMARY KEY NOT NULL,
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
	"last_notified_in_game_id" varchar(25),
	"last_game_ended_at" timestamp,
	CONSTRAINT summoner_puuid_channel_id PRIMARY KEY("puuid","channel_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "summoner_puuid_cache" (
	"puuid" varchar(100) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"icon" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "valorant_match" (
	"id" text PRIMARY KEY NOT NULL,
	"details" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "valorant_player" (
	"puuid" varchar(100),
	"name" text NOT NULL,
	"picture" text,
	"card" text,
	"is_active" boolean DEFAULT true,
	"last_game_id" varchar(100),
	"channel_id" varchar(100) NOT NULL,
	CONSTRAINT valorant_player_puuid_channel_id PRIMARY KEY("puuid","channel_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "valorant_rank" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" varchar(100) NOT NULL,
	"elo" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
