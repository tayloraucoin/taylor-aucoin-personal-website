import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
// Relative, not the `@/` alias: drizzle-kit bundles this file outside Next's
// resolver and does not read tsconfig paths.
import type { LeadNiches } from "../../lib/types/crm";
import { engagements } from "./engagements";

/** Used by one table, so it lives beside it (drizzle conventions §3). */
export const leadThreadEnum = pgEnum("lead_thread", ["no_website", "audit"]);

export const leadWebsiteBucketEnum = pgEnum("lead_website_bucket", [
  "none",
  "social_only",
  "real",
]);

export const leadClosedStateEnum = pgEnum("lead_closed_state", [
  "not_now",
  "not_interested",
  "do_not_call",
  "bad_lead",
]);

/** Mirrored by `ContactChannel` in `lib/types/crm.ts` (M-CRM-8). */
export const contactChannelEnum = pgEnum("contact_channel", [
  "text",
  "email",
]);

/**
 * One prospect on the call list.
 *
 * Two kinds of fact live in this row and they have different owners, which is
 * the single most important thing about this table:
 *
 * **Sync-owned** columns come from Google via leadgen and are overwritten by
 * every `--crm` import. **Admin-owned** columns are what Taylor learned on the
 * phone, and the sync must never touch them (D-CRM-11). The upsert in
 * `server/services/leads.ts` enumerates the sync-owned set explicitly rather
 * than spreading a parsed row, so adding a column here cannot silently make it
 * clobberable — a new column is not synced until someone adds it to that list.
 *
 * **Stage is not stored** (D-CRM-2, and the same reasoning as `engagements`):
 * the row holds facts, and `getLeadStage` derives the display vocabulary from
 * them plus the lead's attempts, emails, and engagement. A stage column would
 * be a second home for "has this person paid", and the two would disagree on
 * the day it mattered.
 *
 * `placeId` is Google's stable key for the business and the upsert identity
 * (M-CRM-4). It is the reason a re-import is idempotent instead of a duplicate
 * pile.
 */
export const leads = pgTable(
  "leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // ---- Sync-owned: leadgen writes these, admin edits do not survive an import.
    address: text("address").notNull().default(""),
    businessName: text("business_name").notNull(),
    city: text("city").notNull(),
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
    leadScore: integer("lead_score").notNull().default(0),
    mapsUrl: text("maps_url").notNull().default(""),
    niche: text("niche").notNull(),
    // JSON shape: LeadNiches — lib/types/crm.ts
    niches: jsonb("niches").$type<LeadNiches>().notNull().default([]),
    phone: text("phone").notNull().default(""),
    rating: real("rating"),
    reviews: integer("reviews"),
    thread: leadThreadEnum("thread").notNull(),
    website: text("website").notNull().default(""),
    websiteBucket: leadWebsiteBucketEnum("website_bucket").notNull(),

    // ---- Admin-owned: never written by sync.
    closedAt: timestamp("closed_at", { withTimezone: true }),
    closedReason: text("closed_reason"),
    closedState: leadClosedStateEnum("closed_state"),
    contactEmail: text("contact_email"),
    /** The person, not the business — captured on a conversation (D-CRM-25). */
    contactName: text("contact_name"),
    /**
     * What drives the queue. Every live lead has one or it is a defect
     * (D-CRM-4) — the scoreboard counts the leads that don't.
     */
    nextActionAt: timestamp("next_action_at", { withTimezone: true }),
    nextActionNote: text("next_action_note"),
    notes: text("notes").notNull().default(""),
    /**
     * Taylor's correction to Google's number, kept separate from it rather
     * than overwriting: the next sync would restore Google's value anyway, and
     * two facts that disagree should both be visible. Display is
     * `phoneOverride ?? phone`.
     */
    phoneOverride: text("phone_override"),
    /** How they said they'd rather hear back — captured on a conversation,
     * null until one happens (D-CRM-25). */
    preferredChannel: contactChannelEnum("preferred_channel"),

    /** Google's stable id for the place. The upsert identity (M-CRM-4). */
    placeId: text("place_id").notNull(),

    /**
     * The bridge to the money. Unique: one engagement belongs to one lead, so
     * a mistaken second link fails loudly at the database rather than
     * producing two pipeline rows claiming the same deposit.
     *
     * `set null` on delete, not cascade — deleting an engagement must never
     * take the call history with it.
     */
    engagementId: uuid("engagement_id").references(() => engagements.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    uniqueIndex("leads_place_id_idx").on(table.placeId),
    uniqueIndex("leads_engagement_id_idx").on(table.engagementId),
    // The queue's own query: live leads (closed_state null or 'not_now')
    // ordered by when they come due.
    index("leads_queue_idx").on(table.closedState, table.nextActionAt),
    index("leads_thread_idx").on(table.thread),
  ],
);

export const leadsRelations = relations(leads, ({ one }) => ({
  engagement: one(engagements, {
    fields: [leads.engagementId],
    references: [engagements.id],
  }),
}));
