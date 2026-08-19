import Stripe from "stripe";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { engagements } from "@/db/schema";
import { requireEnv } from "@/lib/env";
import type { Engagement } from "./engagement";

/**
 * Pinned to the API version this SDK was generated against. Left unset, an SDK
 * bump would silently change request and webhook shapes underneath a money
 * path — the one place in this codebase where "probably still works" is not a
 * standard worth holding.
 */
const STRIPE_API_VERSION = "2026-07-29.dahlia";

/**
 * Appended to the account's shortened descriptor on the client's statement.
 *
 * The line a client sees has to match the site they paid on, or it reads as a
 * charge they do not recognise — which is a chargeback rather than a question.
 */
const DEPOSIT_DESCRIPTOR_SUFFIX = "DEPOSIT";

/**
 * Lazy, for the same reason the database client is: a module-level client
 * would read the secret key at import time and break every build and script
 * that merely touches this file's types.
 */
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  stripe ??= new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
    apiVersion: STRIPE_API_VERSION,
  });
  return stripe;
}

export function getWebhookSecret(): string {
  return requireEnv("STRIPE_WEBHOOK_SECRET");
}

export function constructWebhookEvent(
  rawBody: string,
  signature: string,
): Stripe.Event {
  return getStripe().webhooks.constructEvent(
    rawBody,
    signature,
    getWebhookSecret(),
  );
}

function intakeOrigin(): string {
  return requireEnv("NEXT_PUBLIC_SITE_URL").replace(/\/+$/, "");
}

/**
 * Opens a hosted Stripe Checkout session for the deposit.
 *
 * Hosted, not embedded: this app designs no card UI, holds no card data, and
 * gets Apple Pay and Google Pay for free — which matter enormously to someone
 * paying from a phone in a van.
 *
 * A fresh session per attempt. A client who backs out and returns later gets a
 * new one rather than a resumed session that may have expired; Stripe cleans
 * up the strays, and reusing them buys nothing but a class of stale-state bugs.
 *
 * The returned URL is a redirect target and nothing else — no part of the
 * payment decision happens here. Fulfillment is `fulfillDeposit`, reached only
 * by a signature-verified webhook.
 */
export async function createDepositCheckout(
  engagement: Engagement,
  token: string,
): Promise<string> {
  if (!engagement.depositRequired || engagement.paidAt) {
    throw new Error("Engagement does not require a deposit.");
  }

  const origin = intakeOrigin();

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: engagement.contactEmail,
    // The engagement id is the only link back from Stripe to us. The token is
    // deliberately absent: it is the client's credential and has no business
    // living in a third party's dashboard.
    metadata: { engagement_id: engagement.id },
    line_items: [
      {
        quantity: 1,
        // The saved Price, not an inline amount. A standard build is a
        // standard price, so it lives in Stripe's catalogue where there is one
        // of it — rather than being retyped per client, where a wrong digit is
        // a mispriced deal with nothing to check it against.
        //
        // `engagement.depositAmountCents` is no longer the source of the
        // charge. It is still written at fulfillment as the record of what
        // this client actually paid, because prices change and the intake
        // document should reflect the deal as struck.
        price: requireEnv("STRIPE_PRICE_DEPOSIT"),
      },
    ],
    payment_intent_data: {
      statement_descriptor_suffix: DEPOSIT_DESCRIPTOR_SUFFIX,
    },
    success_url: `${origin}/intake/${token}?paid=1`,
    cancel_url: `${origin}/intake/${token}?canceled=1`,
  });

  if (!session.url) throw new Error("Stripe returned a session with no URL.");

  await getDb()
    .update(engagements)
    .set({ stripeCheckoutSessionId: session.id, updatedAt: new Date() })
    .where(eq(engagements.id, engagement.id));

  return session.url;
}

/**
 * The standard deposit, read from Stripe's catalogue.
 *
 * One network call on a screen that is already dynamic, and it means the pay
 * screen cannot drift from what the client is actually charged: the amount
 * displayed and the amount collected come from the same Price object.
 */
export async function getDepositPrice(): Promise<{
  amountCents: number;
  currency: string;
}> {
  const price = await getStripe().prices.retrieve(
    requireEnv("STRIPE_PRICE_DEPOSIT"),
  );

  if (price.unit_amount === null) {
    throw new Error("STRIPE_PRICE_DEPOSIT has no fixed unit amount.");
  }

  return { amountCents: price.unit_amount, currency: price.currency };
}

/**
 * Marks a deposit paid. The only function that may do so.
 *
 * Idempotent by query shape, not by a prior read: the `paid_at is null`
 * predicate lives in the UPDATE itself, so two concurrent deliveries of the
 * same event cannot both win. Stripe retries on any non-2xx and replays are
 * routine — this has to be boring under repetition.
 *
 * This is the one sanctioned reader of `engagements` that does not go through
 * `requireEngagement`, because a webhook has no token; it carries an
 * engagement id in metadata and a verified signature instead. Nothing else may
 * copy this exception.
 */
export async function fulfillDeposit(
  engagementId: string,
  paymentIntentId: string | null,
  amountPaidCents?: number | null,
): Promise<"fulfilled" | "already_paid" | "unknown"> {
  const now = new Date();

  const [updated] = await getDb()
    .update(engagements)
    .set({
      paidAt: now,
      stripePaymentIntentId: paymentIntentId,
      // What this client actually paid, captured from the settled session.
      // Prices change; the intake document should show the deal as struck
      // rather than today's list price.
      ...(typeof amountPaidCents === "number"
        ? { depositAmountCents: amountPaidCents }
        : {}),
      updatedAt: now,
    })
    .where(and(eq(engagements.id, engagementId), isNull(engagements.paidAt)))
    .returning({ id: engagements.id });

  if (updated) return "fulfilled";

  const [existing] = await getDb()
    .select({ id: engagements.id })
    .from(engagements)
    .where(eq(engagements.id, engagementId))
    .limit(1);

  return existing ? "already_paid" : "unknown";
}
