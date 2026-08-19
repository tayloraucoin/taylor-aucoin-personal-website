CREATE TYPE "public"."email_event_kind" AS ENUM('resume_link', 'reminder_1', 'reminder_2', 'reminder_3', 'completion', 'output');--> statement-breakpoint
CREATE TABLE "email_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"kind" "email_event_kind" NOT NULL,
	"engagement_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engagements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"business_name" text NOT NULL,
	"completed_at" timestamp with time zone,
	"contact_email" text NOT NULL,
	"contact_name" text NOT NULL,
	"contact_phone" text,
	"currency" text DEFAULT 'cad' NOT NULL,
	"current_step" integer DEFAULT 0 NOT NULL,
	"deposit_amount_cents" integer,
	"deposit_required" boolean DEFAULT true NOT NULL,
	"last_activity_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"project_summary" text,
	"sent_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"stripe_checkout_session_id" text,
	"stripe_payment_intent_id" text,
	"token_expires_at" timestamp with time zone NOT NULL,
	"token_hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intake_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"field_key" text NOT NULL,
	"mime_type" text,
	"original_name" text,
	"size_bytes" integer,
	"step" integer,
	"storage_path" text NOT NULL,
	"uploaded_at" timestamp with time zone,
	"engagement_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intake_files" ADD CONSTRAINT "intake_files_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "email_events_send_once_idx" ON "email_events" USING btree ("engagement_id","kind") WHERE kind in ('reminder_1', 'reminder_2', 'reminder_3', 'completion');--> statement-breakpoint
CREATE UNIQUE INDEX "engagements_token_hash_idx" ON "engagements" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "engagements_stripe_checkout_session_id_idx" ON "engagements" USING btree ("stripe_checkout_session_id");--> statement-breakpoint
CREATE INDEX "intake_files_engagement_id_idx" ON "intake_files" USING btree ("engagement_id");