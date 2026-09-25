import { relations } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
// Relative, not the `@/` alias: drizzle-kit bundles this file outside Next's
// resolver and does not read tsconfig paths.
import { engagements } from "./engagements";
import { pipelineSteps } from "./pipeline-steps";

/**
 * Which pipeline steps an engagement has done, and when.
 *
 * A row exists iff the step is done (M-PIPE-5). There is no nullable
 * `completed_at` meaning "not done", because that would be two ways to say
 * one thing. Undo deletes the row. The unique index makes a double press a
 * no-op under `onConflictDoNothing`.
 *
 * `restrict` to the step, `cascade` to the engagement: a step with history
 * cannot be deleted out from under it (M-PIPE-4), and an engagement that is
 * deleted takes its progress with it.
 */
export const engagementStepCompletions = pgTable(
  "engagement_step_completions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    completedAt: timestamp("completed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    engagementId: uuid("engagement_id")
      .notNull()
      .references(() => engagements.id, { onDelete: "cascade" }),
    stepId: uuid("step_id")
      .notNull()
      .references(() => pipelineSteps.id, { onDelete: "restrict" }),
  },
  (table) => [
    uniqueIndex("engagement_step_completions_engagement_step_idx").on(
      table.engagementId,
      table.stepId,
    ),
  ],
);

export const engagementStepCompletionsRelations = relations(
  engagementStepCompletions,
  ({ one }) => ({
    engagement: one(engagements, {
      fields: [engagementStepCompletions.engagementId],
      references: [engagements.id],
    }),
    step: one(pipelineSteps, {
      fields: [engagementStepCompletions.stepId],
      references: [pipelineSteps.id],
    }),
  }),
);
