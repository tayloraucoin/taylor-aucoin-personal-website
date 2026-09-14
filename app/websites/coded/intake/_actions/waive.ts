"use server";

import { redirect } from "next/navigation";
import { showcaseIntakeRoutes } from "@/lib/routes";
import { promoCodeInput } from "@/lib/validators/intake";
import { waiveDepositByCode } from "@/server/services/deposit";
import { notifyOps } from "@/server/services/emails";
import { requireEngagement } from "@/server/services/engagement";

/**
 * Waives the deposit with the free code and sends the client on to the
 * questionnaire.
 *
 * Thin, like `pay.ts`: resolve through the seam, call the service, redirect.
 * The code is resolved again inside the service, so a screen that merely
 * *claimed* the code was accepted cannot open anything — only the code itself
 * can, and only on the coded track.
 *
 * Taylor hears about every use. The other codes are priced into a deal; this
 * one is a credential, and the ops email is how a leaked one gets noticed
 * before the second stranger uses it. Sent after the write and outside the
 * redirect, so a mail failure never strands a client whose deposit has
 * already been waived.
 *
 * `redirect` throws by design in Next, so nothing follows it.
 */
export async function waiveShowcaseDeposit(
  token: string,
  code: unknown,
): Promise<void> {
  const engagement = await requireEngagement(token);

  if (engagement.track !== "showcase") {
    throw new Error("This engagement is not on the coded track.");
  }

  const parsed = promoCodeInput.parse(code);
  if (!parsed) throw new Error("A code is required.");

  const outcome = await waiveDepositByCode(engagement, parsed);

  console.info(`[intake] ${engagement.id} free code → ${outcome}`);

  if (outcome === "waived") {
    await notifyOps(`Deposit waived by code — ${engagement.businessName}`, [
      `A coded-track client used the free code at the pay screen.`,
      ``,
      `Business:   ${engagement.businessName}`,
      `Contact:    ${engagement.contactName} <${engagement.contactEmail}>`,
      `Engagement: ${engagement.id}`,
      ``,
      `Nothing was charged and no Stripe object exists for this. They now have`,
      `the questionnaire. If you did not give this code out, rotate`,
      `SHOWCASE_FREE_CODE.`,
    ]);
  }

  // The entry route reads the new state and lands them on the welcome.
  redirect(showcaseIntakeRoutes.entry(token));
}
