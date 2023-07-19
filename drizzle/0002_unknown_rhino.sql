ALTER TYPE "tier" ADD VALUE 'BRONZE';--> statement-breakpoint
ALTER TYPE "tier" ADD VALUE 'EMERALD';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bet" (
	"id" serial PRIMARY KEY NOT NULL,
	"gambler_id" varchar(25) NOT NULL,
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
	"id" varchar(25) PRIMARY KEY NOT NULL,
	"name" text,
	"avatar" varchar(40),
	"created_at" timestamp DEFAULT now(),
	"points" integer DEFAULT 500
);
--> statement-breakpoint
ALTER TABLE "summoner" ADD COLUMN "last_game_id" varchar(25);