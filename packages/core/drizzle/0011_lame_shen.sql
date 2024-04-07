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
