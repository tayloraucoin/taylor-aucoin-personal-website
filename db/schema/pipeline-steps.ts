import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
// Relative, not the `@/` alias: drizzle-kit bundles this file outside Next's
// resolver and does not read tsconfig paths.
import { engagementEmails } from "./engagement-emails";
import { engagementStepCompletions } from "./engagement-step-completions";

/**
 * One step of the delivery playbook: a prompt Taylor copies into a Claude
 * session, a client email template, or both (M-PIPE-1).
 *
 * There is one pipeline, so there is no parent table. When a second track's
 * process diverges enough to need its own, that is one additive migration.
 *
 * Status is not stored. "Archived" is read from `archived_at` — the same
 * reasoning as `engagements` (M-INT-7).
 *
 * `position` is deliberately not unique (M-PIPE-6). Reads order by
 * `(position, created_at)`, and a reorder rewrites every position in one
 * transaction, so a transient duplicate is harmless and no deferrable
 * constraint is needed.
 *
 * A step that has been completed on an engagement or sent to a client cannot
 * be deleted: both child tables reference it with `restrict` (M-PIPE-4).
 * Archive is the tool for a step with history.
 */
export const pipelineSteps = pgTable(
  "pipeline_steps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /** Plain text with `{{name}}` placeholders. Set iff `emailSubject` is. */
    emailBody: text("email_body"),
    /** Plain text with `{{name}}` placeholders. Set iff `emailBody` is. */
    emailSubject: text("email_subject"),
    position: integer("position").notNull(),
    /** Markdown with `{{name}}` placeholders. Null on an email-only step. */
    prompt: text("prompt"),
    title: text("title").notNull(),
  },
  (table) => [
    index("pipeline_steps_position_idx").on(table.position),
    // A subject with no body, or a body with no subject, is a half-built email
    // step. The database refuses it so no surface has to remember to.
    check(
      "pipeline_steps_email_pair_check",
      sql`(${table.emailSubject} is null) = (${table.emailBody} is null)`,
    ),
  ],
);

export const pipelineStepsRelations = relations(pipelineSteps, ({ many }) => ({
  completions: many(engagementStepCompletions),
  emails: many(engagementEmails),
}));
