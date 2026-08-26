CREATE TYPE "public"."intake_track" AS ENUM('durable', 'showcase');--> statement-breakpoint
ALTER TABLE "engagements" ADD COLUMN "extraction_runs" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "engagements" ADD COLUMN "track" "intake_track" DEFAULT 'durable' NOT NULL;--> statement-breakpoint
ALTER TABLE "intake_files" ADD COLUMN "entry_key" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "track" "intake_track" DEFAULT 'durable' NOT NULL;