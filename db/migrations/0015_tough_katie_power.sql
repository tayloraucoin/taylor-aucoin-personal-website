CREATE TYPE "public"."order_link_reason" AS ENUM('metadata', 'email', 'manual');--> statement-breakpoint
CREATE TYPE "public"."order_source" AS ENUM('checkout', 'invoice');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('open', 'paid', 'failed', 'refunded', 'void');--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text NOT NULL,
	"engagement_id" uuid,
	"imported_at" timestamp with time zone,
	"imported_by" text,
	"link_reason" "order_link_reason",
	"paid_at" timestamp with time zone,
	"source" "order_source" NOT NULL,
	"status" "order_status" NOT NULL,
	"stripe_customer_email" text,
	"stripe_object_id" text NOT NULL,
	"stripe_payment_intent_id" text,
	"tax_cents" integer
);
--> statement-breakpoint
ALTER TABLE "engagement_products" ADD COLUMN "order_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "orders_stripe_object_id_idx" ON "orders" USING btree ("stripe_object_id");--> statement-breakpoint
CREATE INDEX "orders_engagement_id_idx" ON "orders" USING btree ("engagement_id");--> statement-breakpoint
CREATE INDEX "orders_paid_at_idx" ON "orders" USING btree ("paid_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "engagement_products" ADD CONSTRAINT "engagement_products_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "engagement_products_order_id_idx" ON "engagement_products" USING btree ("order_id");