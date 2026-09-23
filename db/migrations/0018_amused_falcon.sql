ALTER TABLE "review_rounds" ADD COLUMN "client_app" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "review_rounds_client_app_idx" ON "review_rounds" USING btree ("client_app");