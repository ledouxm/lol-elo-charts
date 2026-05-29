ALTER TABLE "arena_player" DROP CONSTRAINT "arena_player_puuid_match_id";--> statement-breakpoint
ALTER TABLE "lol_participant" DROP CONSTRAINT "lol_participant_match_id_puuid";--> statement-breakpoint
ALTER TABLE "summoner" DROP CONSTRAINT "summoner_puuid_channel_id";--> statement-breakpoint
ALTER TABLE "valorant_player" DROP CONSTRAINT "valorant_player_puuid_channel_id";--> statement-breakpoint
ALTER TABLE "bet" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "bet" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "bet" ALTER COLUMN "gambler_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "gambler" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "gambler" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "match" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "match" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "player_of_the_day" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "player_of_the_day" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "apex" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "apex" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "rank" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "rank" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "valorant_rank" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "valorant_rank" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "arena_player" ADD CONSTRAINT "arena_player_puuid_match_id_pk" PRIMARY KEY("puuid","match_id");--> statement-breakpoint
ALTER TABLE "lol_participant" ADD CONSTRAINT "lol_participant_match_id_puuid_pk" PRIMARY KEY("match_id","puuid");--> statement-breakpoint
ALTER TABLE "summoner" ADD CONSTRAINT "summoner_puuid_channel_id_pk" PRIMARY KEY("puuid","channel_id");--> statement-breakpoint
ALTER TABLE "valorant_player" ADD CONSTRAINT "valorant_player_puuid_channel_id_pk" PRIMARY KEY("puuid","channel_id");