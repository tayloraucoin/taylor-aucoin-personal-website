import type { NextRequest } from "next/server";
import type Stripe from "stripe";
import { constructWebhookEvent } from "@/server/services/deposit";
import {
  claimStripeEvent,
  releaseStripeEvent,
} from "@/server/services/stripe-events";
import { HANDLERS } from "./_handlers";

/**
 * The single Stripe webhook endpoint.
 *
 * This route does four things and no business logic: verify the signature,
 * claim the event, dispatch to the one file that owns that event type, and
 * translate the outcome into a status code. Every behaviour lives in
 * `_handlers/`, one file per event, so there is exactly one place to look when
 * asking what happens when Stripe says X.
 *
 * The claim is what makes retries safe. Stripe delivers at-least-once and
 * retries on any non-2xx, so a handler that emails or records would otherwise
 * repeat itself on every redelivery. Claim first, act second, and release the
 * claim if the work throws — otherwise a failed attempt would be remembered as
 * done and the retry would skip it entirely.
 *
 * Logging is ids and amounts. A webhook body carries a client's name, email,
 * and what they are paying for; none of that belongs in a log line.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response(null, { status: 400 });

  // Raw text before any parsing — `request.json()` re-serializes the body and
  // the signature never verifies again.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch {
    // No detail echoed: an unverified caller learns nothing about why.
    return new Response(null, { status: 400 });
  }

  const handler = HANDLERS[event.type];

  if (!handler) {
    // Acknowledged, not processed. Retrying would never make it handled.
    return Response.json({ received: true, handled: false });
  }

  const claimed = await claimStripeEvent(event.id, event.type);

  if (!claimed) {
    console.info(`[stripe] ${event.id}: already processed, skipping`);
    return Response.json({ received: true, duplicate: true });
  }

  try {
    await handler(event);
  } catch (error) {
    // Give the claim back so Stripe's retry can actually run.
    await releaseStripeEvent(event.id);

    console.error(
      `[stripe] ${event.id}: handler failed`,
      error instanceof Error ? error.message : "unknown error",
    );

    // Non-2xx asks Stripe to redeliver.
    return new Response(null, { status: 500 });
  }

  return Response.json({ received: true, handled: true });
}
