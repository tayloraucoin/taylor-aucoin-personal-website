import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
// Relative, not the `@/` alias: drizzle-kit bundles this file outside Next's
// resolver and does not read tsconfig paths.
import type { ReviewCommentTarget } from "../../lib/types/review";
import { reviewRounds } from "./review-rounds";

/**
 * One comment a reviewer pinned to an element on a client site's mock.
 *
 * **The id is the client site's, not ours.** A failed write is kept in the
 * reviewer's browser and retried with the same id, so the primary key
 * carries no default: a second arrival of the same comment is a no-op
 * insert, not a duplicate (M-REV-2).
 *
 * Two clocks, on purpose. `client_created_at` is when the reviewer clicked,
 * set by the client site and used for ordering, because a retry hours later
 * must not reorder the conversation. `created_at` is when the row landed
 * here, kept for our own forensics.
 *
 * Deletion is soft. The reviewer's "remove" is a `deleted_at` stamp, so a
 * retry of a delete after a lost response finds nothing to do and still
 * succeeds. Cascade on the round: a comment has no meaning without it.
 */
export const reviewComments = pgTable(
  "review_comments",
  {
    id: uuid("id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    body: text("body").notNull(),
    clientCreatedAt: timestamp("client_created_at", {
      withTimezone: true,
    }).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    /** The page it was left on, e.g. "/review/mocks/kit-a". */
    path: text("path").notNull(),
    // JSON shape: ReviewCommentTarget — see lib/types/review.ts
    target: jsonb("target").$type<ReviewCommentTarget>().notNull(),
    viewportHeight: integer("viewport_height").notNull(),
    viewportWidth: integer("viewport_width").notNull(),

    roundId: uuid("round_id")
      .notNull()
      .references(() => reviewRounds.id, { onDelete: "cascade" }),
  },
  (table) => [
    // The list endpoint filters by round, optionally by path within it; one
    // composite index serves both shapes.
    index("review_comments_round_id_path_idx").on(table.roundId, table.path),
  ],
);

export const reviewCommentsRelations = relations(reviewComments, ({ one }) => ({
  round: one(reviewRounds, {
    fields: [reviewComments.roundId],
    references: [reviewRounds.id],
  }),
}));
