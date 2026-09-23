import { relations } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
// Relative, not the `@/` alias: drizzle-kit bundles this file outside Next's
// resolver and does not read tsconfig paths.
import type { ReviewSubmission } from "../../lib/types/review";
import { reviewRounds } from "./review-rounds";

/**
 * The reviewer's closing feedback for a round: which kit, layout, and mock
 * they preferred, and the three free-text answers.
 *
 * The whole `ReviewSubmission` is one JSONB document, not columns. The
 * questions on the client site's submit form are the client site's to
 * change, and a new question must never require a migration here — the
 * same reasoning as `engagements.answers` (build spec §8). Taylor reads the
 * email; the row is the record.
 *
 * The id is the client site's (M-REV-2): a retry with the same id is a
 * no-op, which is what lets the first receipt — and only the first — stamp
 * the round and send the email. Cascade on the round.
 */
export const reviewSubmissions = pgTable(
  "review_submissions",
  {
    id: uuid("id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // JSON shape: ReviewSubmission — see lib/types/review.ts
    payload: jsonb("payload").$type<ReviewSubmission>().notNull(),

    roundId: uuid("round_id")
      .notNull()
      .references(() => reviewRounds.id, { onDelete: "cascade" }),
  },
  (table) => [index("review_submissions_round_id_idx").on(table.roundId)],
);

export const reviewSubmissionsRelations = relations(
  reviewSubmissions,
  ({ one }) => ({
    round: one(reviewRounds, {
      fields: [reviewSubmissions.roundId],
      references: [reviewRounds.id],
    }),
  }),
);
