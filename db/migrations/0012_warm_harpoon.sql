CREATE TYPE "public"."example_pack" AS ENUM('film', 'generic', 'practice', 'entity', 'venture', 'service');--> statement-breakpoint
CREATE TYPE "public"."example_site_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "example_captures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"height" integer NOT NULL,
	"position" integer NOT NULL,
	"storage_path" text NOT NULL,
	"width" integer NOT NULL,
	"example_site_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "example_packs" (
	"pack" "example_pack" PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"shown_to_clients" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "example_site_packs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"pack" "example_pack" NOT NULL,
	"example_site_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "example_sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"build" text,
	"checked_on" date,
	"density" text,
	"embed" boolean DEFAULT false NOT NULL,
	"first_published_at" timestamp with time zone,
	"ground" text,
	"motion" text,
	"name" text,
	"role" text,
	"slug" text NOT NULL,
	"status" "example_site_status" DEFAULT 'draft' NOT NULL,
	"style_group" text,
	"styles" text[] DEFAULT '{}'::text[] NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"url" text NOT NULL,
	CONSTRAINT "example_sites_styles_max_three" CHECK (coalesce(array_length("example_sites"."styles", 1), 0) <= 3)
);
--> statement-breakpoint
ALTER TABLE "example_captures" ADD CONSTRAINT "example_captures_example_site_id_example_sites_id_fk" FOREIGN KEY ("example_site_id") REFERENCES "public"."example_sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "example_site_packs" ADD CONSTRAINT "example_site_packs_example_site_id_example_sites_id_fk" FOREIGN KEY ("example_site_id") REFERENCES "public"."example_sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "example_captures_site_position_idx" ON "example_captures" USING btree ("example_site_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "example_site_packs_site_pack_idx" ON "example_site_packs" USING btree ("example_site_id","pack");--> statement-breakpoint
CREATE INDEX "example_site_packs_pack_idx" ON "example_site_packs" USING btree ("pack");--> statement-breakpoint
CREATE UNIQUE INDEX "example_sites_slug_idx" ON "example_sites" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "example_sites_status_idx" ON "example_sites" USING btree ("status");