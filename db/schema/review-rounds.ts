import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
// Relative, not the `@/` alias: drizzle-kit bundles this file outside Next's
// resolver and does not read tsconfig paths.
import { engagements } from "./engagements";
import { reviewComments } from "./review-comments";
import { reviewSubmissions } from "./review-submissions";

/**
 * One client design-review round: which sister repo it is, the engagement it
 * belongs to, and the moment the client pressed Submit.
 *
 * Identified by `clientApp`, the static value the client site sends with
 * every request (M-REV-6, superseding M-REV-1's per-round keys). The shared
 * `REVIEW_INGEST_KEY` proves the caller is one of Taylor's repos; the
 * `clientApp` says which. A round is created on first contact.
 *
 * Status is not stored. `submitted_at` is the fact; "open" and "submitted"
 * are read from it — the same reasoning as `engagements` (M-INT-7). A round
 * stays open for comments after submission, so the stamp is a milestone, not
 * a lock.
 */
export const reviewRounds = pgTable(
  "review_rounds",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    /**
     * Which sister repo this round is (M-REV-6): the static `clientApp` the
     * client site sends on every request, e.g. "kryshan-film-portfolio".
     * The round is created the first time a value is seen.
     */
    clientApp: text("client_app").notNull(),
    /** Who is reviewing: the linked engagement's business name, else `clientApp`. */
    clientName: text("client_name").notNull(),
    // Nullable, and `set null` rather than cascade: a round is a record of
    // what a client said about a design, and deleting the engagement it was
    // sold under must not take that record with it.
    engagementId: uuid("engagement_id").references(() => engagements.id, {
      onDelete: "set null",
    }),
    /** What this round is about, as the client site names it. */
    label: text("label").notNull(),
    /** The client site's origin, for Taylor's reference. Never fetched. */
    siteUrl: text("site_url"),
    /** Stamped once, on the first submission received. Never moved. */
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("review_rounds_client_app_idx").on(table.clientApp),
    index("review_rounds_engagement_id_idx").on(table.engagementId),
  ],
);

export const reviewRoundsRelations = relations(
  reviewRounds,
  ({ one, many }) => ({
    engagement: one(engagements, {
      fields: [reviewRounds.engagementId],
      references: [engagements.id],
    }),
    comments: many(reviewComments),
    submissions: many(reviewSubmissions),
  }),
);
