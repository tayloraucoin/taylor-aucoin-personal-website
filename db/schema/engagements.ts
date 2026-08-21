import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
// Relative, not the `@/` alias: drizzle-kit bundles this file outside Next's
// resolver and does not read tsconfig paths.
import type { IntakeAnswers } from "../../lib/types/intake";
import { emailEvents } from "./email-events";
import { intakeFiles } from "./intake-files";

/**
 * One client engagement: the deposit, the questionnaire, and the link that
 * carries both.
 *
 * Two shapes here are load-bearing and cheap to get wrong:
 *
 * The answers are one JSONB document, not columns. Adding a question to the
 * form must never require a migration — see the build spec §8.
 *
 * Status is not stored. The timestamp columns are the facts; the display
 * vocabulary (sent / paid / started / abandoned / complete) is derived from
 * them by `getEngagementStatus` in `server/services/engagement.ts`. An enum
 * that can disagree with its own timestamps is two homes for one fact, and
 * "abandoned" is a function of the current time, which no stored value can be.
 * See TECHNICAL-DECISIONS M-INT-7.
 */
export const engagements = pgTable(
  "engagements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // JSON shape: IntakeAnswers — see lib/types/intake.ts
    answers: jsonb("answers").$type<IntakeAnswers>().notNull().default({}),
    businessName: text("business_name").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    contactEmail: text("contact_email").notNull(),
    contactName: text("contact_name").notNull(),
    contactPhone: text("contact_phone"),
    currency: text("currency").notNull().default("cad"),
    currentStep: integer("current_step").notNull().default(0),
    depositAmountCents: integer("deposit_amount_cents"),
    depositRequired: boolean("deposit_required").notNull().default(true),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    projectSummary: text("project_summary"),
    // AES-256-GCM ciphertext of the URL token, written at creation.
    //
    // The reminder sweep has to compose a client's link without a request to
    // hang it off, and reminder 1 targets exactly the clients who have never
    // opened theirs — so there is no later moment when the plaintext is in
    // hand. This is deliberately weaker than the hash alone (key + ciphertext
    // reveals the token) and it is the price of the product having reminders
    // at all. The key lives only in the environment. See M-INT-19.
    resumeTokenCiphertext: text("resume_token_ciphertext"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    // Acceptance record for the website services terms (terms §2): paying the
    // deposit is agreeing, so fulfillment stamps when and to which version.
    // The version travels in the Checkout session's metadata — it is what the
    // pay screen displayed when the session was created, not whatever happens
    // to be current when the webhook lands.
    termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
    termsVersion: text("terms_version"),
    tokenExpiresAt: timestamp("token_expires_at", {
      withTimezone: true,
    }).notNull(),
    // sha-256 of the URL token. The plaintext is printed once at creation and
    // never persisted, so a leaked database does not leak live links
    // (M-INT-6). Lookup is by hash, which is also the comparison.
    tokenHash: text("token_hash").notNull(),
  },
  (table) => [
    uniqueIndex("engagements_token_hash_idx").on(table.tokenHash),
    index("engagements_stripe_checkout_session_id_idx").on(
      table.stripeCheckoutSessionId,
    ),
  ],
);

/**
 * The child tables import this file and this file imports them back. The cycle
 * is safe because every cross-file reference sits inside a callback Drizzle
 * invokes after all modules have evaluated — never at module top level.
 */
export const engagementsRelations = relations(engagements, ({ many }) => ({
  emailEvents: many(emailEvents),
  files: many(intakeFiles),
}));
