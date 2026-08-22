CREATE TYPE "public"."call_disposition" AS ENUM('no_answer', 'voicemail', 'busy_callback', 'conversation', 'wrong_number', 'not_interested', 'do_not_call');--> statement-breakpoint
CREATE TYPE "public"."lead_closed_state" AS ENUM('not_now', 'not_interested', 'do_not_call', 'bad_lead');--> statement-breakpoint
CREATE TYPE "public"."lead_thread" AS ENUM('no_website', 'audit');--> statement-breakpoint
CREATE TYPE "public"."lead_website_bucket" AS ENUM('none', 'social_only', 'real');--> statement-breakpoint
CREATE TABLE "call_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"disposition" "call_disposition" NOT NULL,
	"interest_tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"note" text,
	"lead_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"body" text NOT NULL,
	"kind" text DEFAULT 'intro' NOT NULL,
	"promo_included" boolean DEFAULT false NOT NULL,
	"resend_id" text,
	"subject" text NOT NULL,
	"to_email" text NOT NULL,
	"lead_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_syncs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"file_name" text NOT NULL,
	"new_count" integer NOT NULL,
	"unchanged_count" integer NOT NULL,
	"updated_count" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"business_name" text NOT NULL,
	"city" text NOT NULL,
	"last_sync_at" timestamp with time zone,
	"lead_score" integer DEFAULT 0 NOT NULL,
	"maps_url" text DEFAULT '' NOT NULL,
	"niche" text NOT NULL,
	"niches" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"rating" real,
	"reviews" integer,
	"thread" "lead_thread" NOT NULL,
	"website" text DEFAULT '' NOT NULL,
	"website_bucket" "lead_website_bucket" NOT NULL,
	"closed_at" timestamp with time zone,
	"closed_reason" text,
	"closed_state" "lead_closed_state",
	"contact_email" text,
	"next_action_at" timestamp with time zone,
	"next_action_note" text,
	"notes" text DEFAULT '' NOT NULL,
	"phone_override" text,
	"place_id" text NOT NULL,
	"engagement_id" uuid
);
--> statement-breakpoint
ALTER TABLE "engagements" ADD COLUMN "reminders_disabled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "call_attempts" ADD CONSTRAINT "call_attempts_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_emails" ADD CONSTRAINT "lead_emails_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "call_attempts_lead_id_idx" ON "call_attempts" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "lead_emails_lead_id_idx" ON "lead_emails" USING btree ("lead_id");--> statement-breakpoint
CREATE UNIQUE INDEX "leads_place_id_idx" ON "leads" USING btree ("place_id");--> statement-breakpoint
CREATE UNIQUE INDEX "leads_engagement_id_idx" ON "leads" USING btree ("engagement_id");--> statement-breakpoint
CREATE INDEX "leads_queue_idx" ON "leads" USING btree ("closed_state","next_action_at");--> statement-breakpoint
CREATE INDEX "leads_thread_idx" ON "leads" USING btree ("thread");