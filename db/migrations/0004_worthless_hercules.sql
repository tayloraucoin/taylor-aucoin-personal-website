CREATE TYPE "public"."invoice_email_kind" AS ENUM('deposit_paid', 'invoice_due', 'invoice_paid');--> statement-breakpoint
CREATE TYPE "public"."product_kind" AS ENUM('build', 'addon', 'round', 'care_plan');--> statement-breakpoint
CREATE TABLE "engagement_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"amount_cents" integer NOT NULL,
	"engagement_id" uuid NOT NULL,
	"paid_at" timestamp with time zone,
	"product_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"kind" "invoice_email_kind" NOT NULL,
	"stripe_object_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"description" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"key" text NOT NULL,
	"kind" "product_kind" NOT NULL,
	"name" text NOT NULL,
	"offered_at_checkout" boolean DEFAULT false NOT NULL,
	"price_cents" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"stripe_price_id" text,
	"stripe_product_id" text
);
--> statement-breakpoint
ALTER TABLE "engagement_products" ADD CONSTRAINT "engagement_products_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_products" ADD CONSTRAINT "engagement_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "engagement_products_once_idx" ON "engagement_products" USING btree ("engagement_id","product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_emails_once_idx" ON "invoice_emails" USING btree ("stripe_object_id","kind");--> statement-breakpoint
CREATE UNIQUE INDEX "products_key_idx" ON "products" USING btree ("key");