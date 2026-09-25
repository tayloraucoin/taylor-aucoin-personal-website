CREATE TYPE "public"."pipeline_prompt_target" AS ENUM('claude', 'claude_code');--> statement-breakpoint
ALTER TABLE "pipeline_steps" ADD COLUMN "prompt_target" "pipeline_prompt_target";--> statement-breakpoint
-- Hand-added (PIPE-6, M-PIPE-7): steps saved before this migration have a
-- prompt and no target, and the check below would refuse them. Backfilled to
-- 'claude' — a labelled guess; Taylor reviews any existing prompt step.
UPDATE "pipeline_steps" SET "prompt_target" = 'claude' WHERE "prompt" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "pipeline_steps" ADD CONSTRAINT "pipeline_steps_prompt_target_check" CHECK (("pipeline_steps"."prompt" is null) = ("pipeline_steps"."prompt_target" is null));