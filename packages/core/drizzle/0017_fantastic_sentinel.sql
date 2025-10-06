ALTER TABLE "lol_participants" ADD COLUMN "win" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "lol_participants" DROP COLUMN IF EXISTS "team";