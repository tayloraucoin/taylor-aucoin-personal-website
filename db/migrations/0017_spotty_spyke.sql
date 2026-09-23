CREATE TABLE "review_comments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"body" text NOT NULL,
	"client_created_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone,
	"path" text NOT NULL,
	"target" jsonb NOT NULL,
	"viewport_height" integer NOT NULL,
	"viewport_width" integer NOT NULL,
	"round_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_rounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"client_name" text NOT NULL,
	"engagement_id" uuid,
	"key_hash" text NOT NULL,
	"label" text NOT NULL,
	"site_url" text,
	"submitted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "review_submissions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"payload" jsonb NOT NULL,
	"round_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_round_id_review_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."review_rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_rounds" ADD CONSTRAINT "review_rounds_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_submissions" ADD CONSTRAINT "review_submissions_round_id_review_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."review_rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "review_comments_round_id_path_idx" ON "review_comments" USING btree ("round_id","path");--> statement-breakpoint
CREATE UNIQUE INDEX "review_rounds_key_hash_idx" ON "review_rounds" USING btree ("key_hash");--> statement-breakpoint
CREATE INDEX "review_rounds_engagement_id_idx" ON "review_rounds" USING btree ("engagement_id");--> statement-breakpoint
CREATE INDEX "review_submissions_round_id_idx" ON "review_submissions" USING btree ("round_id");