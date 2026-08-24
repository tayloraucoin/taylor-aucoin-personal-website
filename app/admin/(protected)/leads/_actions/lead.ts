"use server";

import { revalidatePath } from "next/cache";
import { buildIntroEmail, INTRO_PROMO_CODE } from "@/lib/crm/intro-email";
import { requireEnv } from "@/lib/env";
import { adminRoutes } from "@/lib/routes";
import { requireAdmin } from "@/server/services/admin-auth";
import {
  adjustFollowUp,
  resolveSchedule,
  type ScheduleToken,
} from "@/server/services/calls";
import { sendIntroEmail } from "@/server/services/emails";
import { loadLeadDetail, updateLeadContact } from "@/server/services/leads";

/**
 * Lead-detail writes. Every one calls `requireAdmin` itself — the layout
 * guards rendering, not a POST aimed straight here (M-CRM-1).
 */
export type LeadActionResult = { ok: true } | { ok: false; message: string };

export async function updateContactAction(input: {
  leadId: string;
  contactEmail?: string | null;
  phoneOverride?: string | null;
}): Promise<LeadActionResult> {
  await requireAdmin();

  try {
    await updateLeadContact(input);
    revalidatePath(adminRoutes.lead(input.leadId));
    return { ok: true };
  } catch {
    return { ok: false, message: "Couldn't save that. Try again." };
  }
}

/**
 * The draft, composed server-side.
 *
 * The dialog asks for this rather than building it in the browser, so the
 * words on screen come from the same module the send uses and the site origin
 * comes from the environment rather than from `window.location` — a draft
 * composed on localhost must not email a client a localhost link.
 */
export async function draftIntroAction(input: {
  leadId: string;
  includePromo: boolean;
  forDecisionMaker?: boolean;
}): Promise<
  | {
      ok: true;
      subject: string;
      body: string;
      to: string;
      alreadySent: boolean;
    }
  | { ok: false; message: string }
> {
  await requireAdmin();

  const detail = await loadLeadDetail(input.leadId);
  if (!detail) return { ok: false, message: "That lead is gone." };

  const draft = buildIntroEmail({
    businessName: detail.lead.businessName,
    // The name the call captured (CRM-14). `buildIntroEmail` has always
    // accepted this and nothing ever passed it, so every draft opened with a
    // bare "Hey" for someone Taylor had just been on the phone with.
    firstName: detail.lead.contactName ?? undefined,
    siteOrigin: requireEnv("NEXT_PUBLIC_SITE_URL"),
    includePromo: input.includePromo,
    forDecisionMaker: input.forDecisionMaker,
  });

  return {
    ok: true,
    subject: draft.subject,
    body: draft.body,
    to: detail.lead.contactEmail ?? "",
    // Drives the confirm step: a second intro is allowed, never accidental.
    alreadySent: detail.timeline.some((entry) => entry.kind === "email"),
  };
}

export async function sendIntroAction(input: {
  leadId: string;
  to: string;
  subject: string;
  body: string;
  includePromo: boolean;
}): Promise<LeadActionResult> {
  try {
    await requireAdmin();

    if (!input.to.includes("@")) {
      return { ok: false, message: "That doesn't look like an email address." };
    }

    // The stored flag has to describe the message actually sent, not the
    // checkbox: Taylor can edit the promo line or its link out of the body.
    const promoIncluded =
      input.includePromo && input.body.includes(INTRO_PROMO_CODE);

    const result = await sendIntroEmail({
      leadId: input.leadId,
      to: input.to,
      subject: input.subject,
      body: input.body,
      promoIncluded,
    });

    // Typed once. An address good enough to email is the address to keep, so the
    // next send prefills it and the lead list can show it has one.
    if (result.ok) {
      await updateLeadContact({ leadId: input.leadId, contactEmail: input.to });
    }

    revalidatePath(adminRoutes.lead(input.leadId));
    return result;
  } catch {
    // Never throw out of this action. A thrown server action becomes a 500
    // that Next cannot decode (`undefined.call`) and wipes the draft on
    // screen. The words stay in the form; only the send failed.
    return {
      ok: false,
      message: "The email didn't send. Your draft is still here — try again.",
    };
  }
}

export async function scheduleCallbackAction(input: {
  leadId: string;
  schedule?: ScheduleToken;
  nextActionAt?: Date;
  nextActionNote?: string;
}): Promise<LeadActionResult> {
  await requireAdmin();

  try {
    await adjustFollowUp({
      leadId: input.leadId,
      nextActionAt:
        input.nextActionAt ??
        (input.schedule ? resolveSchedule(input.schedule) : undefined),
      nextActionNote: input.nextActionNote,
    });

    revalidatePath(adminRoutes.lead(input.leadId));
    revalidatePath(adminRoutes.leads);
    revalidatePath(adminRoutes.queue);
    return { ok: true };
  } catch {
    return { ok: false, message: "Couldn't schedule that. Try again." };
  }
}
