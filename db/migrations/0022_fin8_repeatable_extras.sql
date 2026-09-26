ALTER TYPE "public"."invoice_email_kind" ADD VALUE 'extras_paid';--> statement-breakpoint
DROP INDEX "engagement_products_once_idx";--> statement-breakpoint
ALTER TABLE "engagement_products" ADD COLUMN "checkout_session_id" text;--> statement-breakpoint
ALTER TABLE "engagement_products" ADD COLUMN "repeatable" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "repeatable" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "engagement_products_pending_idx" ON "engagement_products" USING btree ("engagement_id","product_id") WHERE paid_at is null;--> statement-breakpoint
CREATE INDEX "engagement_products_checkout_session_id_idx" ON "engagement_products" USING btree ("checkout_session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "engagement_products_once_idx" ON "engagement_products" USING btree ("engagement_id","product_id") WHERE not repeatable;--> statement-breakpoint
-- Hand-added (FIN-8, M-FIN-6): the rows one engagement may buy more than
-- once. `yarn db:seed` writes the same flag for every row, including the two
-- coded-track rounds it adds; this sets it for rows that already exist so the
-- basket backfill below reads the right value before the next seed.
UPDATE "products" SET "repeatable" = true WHERE "key" IN ('extra_page', 'showcase_extra_page', 'showcase_seo_post', 'changes_standard', 'changes_small');--> statement-breakpoint
-- Every existing basket row takes its product's flag. All of them already
-- satisfy the once-only index, which is what they were written under.
UPDATE "engagement_products" SET "repeatable" = "products"."repeatable" FROM "products" WHERE "products"."id" = "engagement_products"."product_id";
