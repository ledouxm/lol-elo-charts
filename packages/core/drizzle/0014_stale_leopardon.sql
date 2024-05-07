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
