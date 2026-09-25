CREATE TABLE "engagement_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"body" text NOT NULL,
	"resend_id" text,
	"subject" text NOT NULL,
	"to_email" text NOT NULL,
	"engagement_id" uuid NOT NULL,
	"step_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engagement_step_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"engagement_id" uuid NOT NULL,
	"step_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	"email_body" text,
	"email_subject" text,
	"position" integer NOT NULL,
	"prompt" text,
	"title" text NOT NULL,
	CONSTRAINT "pipeline_steps_email_pair_check" CHECK (("pipeline_steps"."email_subject" is null) = ("pipeline_steps"."email_body" is null))
);
--> statement-breakpoint
ALTER TABLE "engagements" ADD COLUMN "pipeline_values" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "engagement_emails" ADD CONSTRAINT "engagement_emails_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_emails" ADD CONSTRAINT "engagement_emails_step_id_pipeline_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."pipeline_steps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_step_completions" ADD CONSTRAINT "engagement_step_completions_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_step_completions" ADD CONSTRAINT "engagement_step_completions_step_id_pipeline_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."pipeline_steps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "engagement_emails_engagement_id_idx" ON "engagement_emails" USING btree ("engagement_id");--> statement-breakpoint
CREATE UNIQUE INDEX "engagement_step_completions_engagement_step_idx" ON "engagement_step_completions" USING btree ("engagement_id","step_id");--> statement-breakpoint
CREATE INDEX "pipeline_steps_position_idx" ON "pipeline_steps" USING btree ("position");