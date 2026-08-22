"use server";

import { revalidatePath } from "next/cache";
import { adminRoutes } from "@/lib/routes";
import { requireAdmin } from "@/server/services/admin-auth";
import { buildIntakeUrl, createEngagement } from "@/server/services/engagement";
import {
  linkEngagement,
  loadLeadDetail,
  unlinkEngagement,
} from "@/server/services/leads";

export type EngagementActionResult =
  { ok: true } | { ok: false; message: string };

/**
 * Mint an intake link for a lead, prefilled with everything Taylor already
 * knows (D-INT-8 — never ask a client what we have).
 *
 * The plaintext token exists exactly once, at creation, and is never stored
 * (M-INT-6). It is returned here so the link can be shown and copied, and if
 * that screen is closed the link is gone — which is why the result is rendered
 * immediately rather than behind another click.
 */
export async function createIntakeLinkAction(input: {
  leadId: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  projectSummary?: string;
}): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  await requireAdmin();

  const detail = await loadLeadDetail(input.leadId);
  if (!detail) return { ok: false, message: "That lead is gone." };

  if (detail.lead.engagementId) {
    return {
      ok: false,
      message: "This lead already has an intake link. Unlink it first.",
    };
  }

  try {
    const { engagement, token } = await createEngagement({
      businessName: detail.lead.businessName,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone || undefined,
      projectSummary: input.projectSummary || undefined,
      currency: "cad",
      depositRequired: true,
    });

    const linked = await linkEngagement(input.leadId, engagement.id);
    if (!linked.ok) return linked;

    revalidatePath(adminRoutes.lead(input.leadId));
    return { ok: true, url: buildIntakeUrl(token) };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? `Couldn't create the link: ${error.message}`
          : "Couldn't create the link.",
    };
  }
}

export async function linkEngagementAction(input: {
  leadId: string;
  engagementId: string;
}): Promise<EngagementActionResult> {
  await requireAdmin();

  const result = await linkEngagement(input.leadId, input.engagementId);
  revalidatePath(adminRoutes.lead(input.leadId));
  return result;
}

export async function unlinkEngagementAction(input: {
  leadId: string;
}): Promise<EngagementActionResult> {
  await requireAdmin();

  await unlinkEngagement(input.leadId);
  revalidatePath(adminRoutes.lead(input.leadId));
  return { ok: true };
}
