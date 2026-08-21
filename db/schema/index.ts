import type { emailEvents } from "./email-events";
import type { engagementProducts } from "./engagement-products";
import type { engagements } from "./engagements";
import type { intakeFiles } from "./intake-files";
import type { invoiceEmails } from "./invoice-emails";
import type { products } from "./products";
import type { stripeEvents } from "./stripe-events";

export * from "./email-events";
export * from "./engagement-products";
export * from "./engagements";
export * from "./intake-files";
export * from "./invoice-emails";
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
