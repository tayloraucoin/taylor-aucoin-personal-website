CREATE TYPE "public"."contact_channel" AS ENUM('text', 'email');--> statement-breakpoint
ALTER TABLE "call_attempts" ADD COLUMN "link_texted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "contact_name" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "preferred_channel" "contact_channel";