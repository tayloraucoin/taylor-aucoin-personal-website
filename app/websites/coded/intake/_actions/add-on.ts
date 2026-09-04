"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createAddonCheckout,
  MID_INTAKE_ADDONS,
} from "@/server/services/deposit";
import { requireEngagement } from "@/server/services/engagement";

/**
 * Opens Checkout for one add-on, at the client's own request.
 *
 * Thin: resolve through the seam, call the service, redirect. The browser names
 * a **catalogue key from a closed list** and never a product id, never an
 * amount — the service resolves the price against the live catalogue and checks
 * it against Stripe before a session exists, which is the whole reason this is
 * a server action and not a fetch with a body.
 *
 * Every refusal lives in the service, where it is next to the invariant it
 * protects. This file's job is to make sure the thing being refused belongs to
 * the right engagement.
 *
 * `redirect` throws by design in Next, so nothing follows it.
 */
const input = z.object({
  token: z.string().min(1),
  key: z.enum(MID_INTAKE_ADDONS),
});

export async function startAddonCheckout(
  token: unknown,
  key: unknown,
): Promise<void> {
  const parsed = input.parse({ token, key });
  const engagement = await requireEngagement(parsed.token);

  // A durable engagement cannot buy a coded add-on. Its own tree's actions are
  // the only ones that may charge it.
  if (engagement.track !== "showcase") {
    throw new Error("This engagement is not on the coded track.");
  }

  redirect(await createAddonCheckout(engagement, parsed.token, parsed.key));
}
