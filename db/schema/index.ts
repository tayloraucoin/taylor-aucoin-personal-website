import type { callAttempts } from "./call-attempts";
import type { emailEvents } from "./email-events";
import type { engagementProducts } from "./engagement-products";
import type { engagements } from "./engagements";
import type {
  exampleCaptures,
  examplePacks,
  exampleSitePacks,
  exampleSites,
} from "./example-sites";
import type { intakeFeedback } from "./intake-feedback";
import type { intakeFiles } from "./intake-files";
import type { invoiceEmails } from "./invoice-emails";
import type { leadEmails } from "./lead-emails";
import type { leadSyncs } from "./lead-syncs";
import type { leads } from "./leads";
import type { orders } from "./orders";
import type { products } from "./products";
import type { stripeEvents } from "./stripe-events";

export * from "./call-attempts";
export * from "./email-events";
export * from "./engagement-products";
export * from "./engagements";
export * from "./example-pack";
export * from "./example-sites";
export * from "./intake-feedback";
export * from "./intake-files";
export * from "./intake-track";
export * from "./invoice-emails";
export * from "./lead-emails";
export * from "./lead-syncs";
export * from "./leads";
export * from "./orders";
export * from "./products";
export * from "./stripe-events";

/**
 * Row types, inferred from the schema so they cannot drift from it.
 *
 * `EngagementRow` is the database's shape and stays inside `db/` and
 * `server/services/`. Pages and actions receive the narrowed `Engagement`
 * domain type from `server/services/engagement.ts`, which drops the token hash
 * and the Stripe identifiers — structurally, so they cannot leak by accident.
 */
export type EngagementRow = typeof engagements.$inferSelect;
export type NewEngagementRow = typeof engagements.$inferInsert;

/**
 * Taste-gallery rows.
 *
 * `ExampleSiteRow` is the database's shape, with every column a draft
 * legitimately lacks nullable. Client-facing surfaces never see it: they
 * receive the `ExampleSite` content contract from
 * `server/services/example-sites.ts`, built only from published rows and
 * validated on the way out, so a half-tagged draft cannot reach a gallery
 * structurally rather than by promise (M-PORT-42).
 */
export type ExampleSiteRow = typeof exampleSites.$inferSelect;
export type NewExampleSiteRow = typeof exampleSites.$inferInsert;

export type ExampleCaptureRow = typeof exampleCaptures.$inferSelect;
export type NewExampleCaptureRow = typeof exampleCaptures.$inferInsert;

export type ExampleSitePackRow = typeof exampleSitePacks.$inferSelect;
export type NewExampleSitePackRow = typeof exampleSitePacks.$inferInsert;

export type ExamplePackRow = typeof examplePacks.$inferSelect;
export type NewExamplePackRow = typeof examplePacks.$inferInsert;

export type IntakeFeedbackRow = typeof intakeFeedback.$inferSelect;
export type NewIntakeFeedbackRow = typeof intakeFeedback.$inferInsert;

export type IntakeFileRow = typeof intakeFiles.$inferSelect;
export type NewIntakeFileRow = typeof intakeFiles.$inferInsert;

export type StripeEventRow = typeof stripeEvents.$inferSelect;

export type EmailEventRow = typeof emailEvents.$inferSelect;
export type NewEmailEventRow = typeof emailEvents.$inferInsert;

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;

export type EngagementProductRow = typeof engagementProducts.$inferSelect;
export type NewEngagementProductRow = typeof engagementProducts.$inferInsert;

export type InvoiceEmailRow = typeof invoiceEmails.$inferSelect;

/**
 * The ledger row (M-FIN-1). Written only by `recordOrder`; the admin reads it
 * through `server/services/orders.ts`, which is where the customer email is
 * dropped for every surface but the unlinked-order detail.
 */
export type OrderRow = typeof orders.$inferSelect;
export type NewOrderRow = typeof orders.$inferInsert;

/**
 * CRM rows.
 *
 * `LeadRow` is the database's shape. Surfaces receive it narrowed by
 * `server/services/leads.ts`, which attaches the derived stage and call-window
 * — neither of which is a column, and neither of which any page should be
 * computing for itself.
 */
export type LeadRow = typeof leads.$inferSelect;
export type NewLeadRow = typeof leads.$inferInsert;

export type CallAttemptRow = typeof callAttempts.$inferSelect;
export type NewCallAttemptRow = typeof callAttempts.$inferInsert;

export type LeadEmailRow = typeof leadEmails.$inferSelect;
export type NewLeadEmailRow = typeof leadEmails.$inferInsert;

export type LeadSyncRow = typeof leadSyncs.$inferSelect;
export type NewLeadSyncRow = typeof leadSyncs.$inferInsert;
