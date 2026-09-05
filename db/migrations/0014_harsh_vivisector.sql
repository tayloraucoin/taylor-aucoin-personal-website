CREATE TABLE "intake_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"enjoyment" integer,
	"confidence" integer,
	"thoughts" text,
	"engagement_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "intake_feedback" ADD CONSTRAINT "intake_feedback_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "intake_feedback_engagement_id_idx" ON "intake_feedback" USING btree ("engagement_id");