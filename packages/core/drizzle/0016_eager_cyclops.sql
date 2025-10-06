CREATE TABLE IF NOT EXISTS "lol_participants" (
	"match_id" varchar(25) NOT NULL,
	"puuid" varchar(100) NOT NULL,
	"team" integer,
	CONSTRAINT lol_participants_match_id_puuid PRIMARY KEY("match_id","puuid")
);
