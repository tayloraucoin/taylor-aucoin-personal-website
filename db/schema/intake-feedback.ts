import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
// Relative, not the `@/` alias: drizzle-kit bundles this file outside Next's
// resolver and does not read tsconfig paths.
import { engagements } from "./engagements";

/**
 * What a client thought of filling the intake in, asked once at the end.
 *
 * Its own table rather than columns on the engagement, for the ordinary
 * reason: this is a thing that happened at a moment, not an attribute of the
 * project. A client who sends a second thought a day later gets a second row,
 * and the first one stays exactly as it was written.
 *
 * **Nothing here is required and nothing gates the done screen.** The
 * questionnaire is already finished by the time this is offered — the form is
 * behind a button that has to be pressed, and a client who ignores it has
 * completed their intake in full (D-INT-4's reasoning, at the one point on the
 * flow where there is nothing left to answer).
 *
 * The two scores are 1–7 and are stored as given. They are a feeling about a
 * form, not a metric to average into a dashboard, and the free text beside
 * them is the part worth reading.
 *
 * Cascade on delete: feedback about an engagement has no meaning without it.
 */
export const intakeFeedback = pgTable(
  "intake_feedback",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    /**
     * How much they enjoyed it, 1–7. Nullable because a client may have
     * something to say and no interest in scoring anything, and forcing a
     * default would invent an opinion they did not express.
     */
    enjoyment: integer("enjoyment"),
    /** How confident they feel about what comes out of it, 1–7. */
    confidence: integer("confidence"),
    thoughts: text("thoughts"),

    engagementId: uuid("engagement_id")
      .notNull()
      .references(() => engagements.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("intake_feedback_engagement_id_idx").on(table.engagementId),
  ],
);

export const intakeFeedbackRelations = relations(intakeFeedback, ({ one }) => ({
  engagement: one(engagements, {
    fields: [intakeFeedback.engagementId],
    references: [engagements.id],
  }),
}));
