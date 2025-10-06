CREATE TABLE IF NOT EXISTS "lol_participant" (
	"match_id" varchar(25) NOT NULL,
	"puuid" varchar(100) NOT NULL,
	"win" boolean NOT NULL,
	"team" integer NOT NULL,
	CONSTRAINT lol_participant_match_id_puuid PRIMARY KEY("match_id","puuid")
);
--> statement-breakpoint
DROP TABLE "lol_participants";