ALTER TABLE "intake_files" ADD COLUMN "transcribed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "intake_files" ADD COLUMN "transcript" text;--> statement-breakpoint
ALTER TABLE "intake_files" ADD COLUMN "transcript_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "intake_files" ADD COLUMN "transcript_edited_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "intake_files" ADD COLUMN "transcript_model" text;--> statement-breakpoint
ALTER TABLE "intake_files" ADD COLUMN "transcript_status" text;