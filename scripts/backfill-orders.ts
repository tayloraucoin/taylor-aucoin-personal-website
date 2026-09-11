import { parseArgs } from "node:util";
import { like } from "drizzle-orm";
import { getDb } from "@/db/client";
import { invoiceEmails } from "@/db/schema";
import { getStripe } from "@/server/services/deposit";
import {
  findOrderByStripeObjectId,
  recordOrder,
} from "@/server/services/orders";
import { applyTierEnv, currentTier } from "./_env";

applyTierEnv();

/**
 * Converts every payment made before the ledger existed into an `orders` row.
 *
 *   yarn orders:backfill            # writes
 *   yarn orders:backfill --dry-run  # prints what it would do
 *
 * Two sources, walked in order:
 *
 * 1. **Every completed Checkout session on this Stripe tier that carries
 *    `engagement_id` metadata** — which is every session the site ever
 *    created: deposits, pay-in-full, add-ons, extra pages. Walked from Stripe
 *    rather than from `engagements.stripe_checkout_session_id`, because that
 *    column holds only the deposit's session and an ancillary purchase has
 *    no column of its own.
 * 2. **Every Stripe invoice the site has emailed about** — the `in_` rows in
 *    `invoice_emails`. Dashboard invoices the site never heard of are not
 *    payments it can vouch for; they arrive through the admin's import.
 *
 * Idempotent by construction: `recordOrder` upserts on the Stripe id and
 * fills nulls only, so a second run creates nothing and changes nothing but
 * `updated_at`. Which is also what lets this repair a hand-settled deposit —
 * the 2026-09-11 shape, `paid_at` set by SQL with the basket row unstamped —
 * without any special case: the row records, the basket links, the nulls
 * fill, and `paid_at` is not touched.
 *
 * One line per object, a total at the end, and a non-zero exit if any fetch
 * failed so a cron or a human notices. Ids and cents only; never a name.
 */
async function main(): Promise<void> {
  const { values } = parseArgs({
    options: { "dry-run": { type: "boolean", default: false } },
  });
  const dryRun = values["dry-run"] === true;

  console.log(
    `Backfilling orders on tier ${currentTier()}${dryRun ? " (dry run — nothing will be written)" : ""}.`,
  );

  const stripe = getStripe();
  const tally = { created: 0, present: 0, skipped: 0, failed: 0 };

  // -- 1. Checkout sessions ------------------------------------------------

  for await (const session of stripe.checkout.sessions.list({ limit: 100 })) {
    const engagementId = session.metadata?.engagement_id?.trim();

    if (!engagementId) {
      // Not ours. A session without our metadata was not created by this
      // site; nothing here can say what it paid for.
      tally.skipped += 1;
      continue;
    }

    if (session.status !== "complete") {
      // Open or expired: never paid. Recording an open session would list a
      // Checkout the client abandoned as if it were money.
      tally.skipped += 1;
      continue;
    }

    try {
      if (dryRun) {
        const existing = await findOrderByStripeObjectId(session.id);
        report(session.id, existing ? "present" : "would create", session.amount_total);
        tally[existing ? "present" : "created"] += 1;
        continue;
      }

      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 100,
      });

      const { created } = await recordOrder({
        kind: "checkout",
        session,
        lineItems: lineItems.data,
      });

      report(session.id, created ? "created" : "present", session.amount_total);
      tally[created ? "created" : "present"] += 1;
    } catch (error) {
      tally.failed += 1;
      console.error(
        `  ${session.id}  FAILED  ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  }

  // -- 2. Invoices the site emailed about ----------------------------------

  const emailed = await getDb()
    .selectDistinct({ stripeObjectId: invoiceEmails.stripeObjectId })
    .from(invoiceEmails)
    .where(like(invoiceEmails.stripeObjectId, "in\\_%"));

  for (const { stripeObjectId } of emailed) {
    try {
      if (dryRun) {
        const existing = await findOrderByStripeObjectId(stripeObjectId);
        report(stripeObjectId, existing ? "present" : "would create", null);
        tally[existing ? "present" : "created"] += 1;
        continue;
      }

      const invoice = await stripe.invoices.retrieve(stripeObjectId, {
        expand: ["payments"],
      });

      const { created } = await recordOrder({ kind: "invoice", invoice });

      report(stripeObjectId, created ? "created" : "present", invoice.total);
      tally[created ? "created" : "present"] += 1;
    } catch (error) {
      tally.failed += 1;
      console.error(
        `  ${stripeObjectId}  FAILED  ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  }

  console.log(
    `\n${dryRun ? "Would create" : "Created"} ${tally.created} · already present ${tally.present} · skipped ${tally.skipped} · failed ${tally.failed}`,
  );

  if (tally.failed > 0) process.exitCode = 1;
}

function report(id: string, outcome: string, cents: number | null): void {
  const amount = cents === null ? "" : `  ${cents} cents`;
  console.log(`  ${id}  ${outcome}${amount}`);
}

main().then(
  () => process.exit(process.exitCode ?? 0),
  (error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
