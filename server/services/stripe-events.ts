import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { stripeEvents } from "@/db/schema";

/**
 * Claims a Stripe event for processing, exactly once.
 *
 * Returns true the first time an event id is seen and false on every
 * redelivery. The claim is a single insert with a conflict clause, so two
 * concurrent deliveries of the same event cannot both win — there is no
 * read-then-write window between checking and claiming.
 *
 * Claim before doing the work, not after. A handler that acts first and
 * records second will repeat its side effects whenever it crashes in between,
 * which is the failure this exists to prevent.
 */
export async function claimStripeEvent(
  eventId: string,
  eventType: string,
): Promise<boolean> {
  const claimed = await getDb()
    .insert(stripeEvents)
    .values({ id: eventId, type: eventType })
    .onConflictDoNothing()
    .returning({ id: stripeEvents.id });

  return claimed.length > 0;
}

/**
 * Releases a claim so a redelivery can retry.
 *
 * Called when a handler fails: Stripe will retry on the non-2xx, and without
 * this the retry would be skipped as already-processed and the work would
 * never happen at all.
 */
export async function releaseStripeEvent(eventId: string): Promise<void> {
  await getDb().delete(stripeEvents).where(eq(stripeEvents.id, eventId));
}
