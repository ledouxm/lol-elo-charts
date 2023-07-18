/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'summoner'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

ALTER TABLE "summoner" DROP CONSTRAINT "summoner_pkey";--> statement-breakpoint
ALTER TABLE "summoner" ALTER COLUMN "puuid" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "summoner" ADD CONSTRAINT "summoner_puuid_channel_id" PRIMARY KEY("puuid","channel_id");