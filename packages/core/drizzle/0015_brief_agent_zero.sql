CREATE TABLE IF NOT EXISTS "wow_character" (
	"id" serial PRIMARY KEY NOT NULL,
	"region" varchar(10),
	"realm" varchar(50),
	"name" varchar(50),
	"last_crawled_at" varchar(50),
	"class" varchar(50),
	"spec" varchar(50),
	"thumbnail_url" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wow_mythic_run" (
	"url" varchar(255) PRIMARY KEY NOT NULL,
	"character_id" integer NOT NULL,
	"dungeon" varchar(100),
	"short_name" varchar(100),
	"mythic_level" integer,
	"completed_at" timestamp,
	"clear_time_ms" integer,
	"par_time_ms" integer,
	"num_keystone_upgrades" integer,
	"map_challenge_mode_id" integer,
	"icon_url" varchar(255),
	"background_image_url" varchar(255),
	"score" integer,
	"created_at" timestamp DEFAULT now()
);
