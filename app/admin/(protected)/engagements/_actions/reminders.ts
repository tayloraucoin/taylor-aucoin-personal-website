"use server";

import { revalidatePath } from "next/cache";
import { adminRoutes } from "@/lib/routes";
import { requireAdmin } from "@/server/services/admin-auth";
import { setRemindersDisabled } from "@/server/services/engagement-admin";

/**
 * The reminder kill switch, and deliberately nothing else.
 *
 * There is no "send another nudge" action here and there must never be one:
 * the ceiling of three is a database constraint (`email_events`' partial
 * unique index), and an admin button that could raise it would make the
 * promise a matter of restraint rather than structure.
 */
export async function setRemindersAction(input: {
  engagementId: string;
  disabled: boolean;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireAdmin();

  try {
    await setRemindersDisabled(input.engagementId, input.disabled);
    revalidatePath(adminRoutes.engagement(input.engagementId));
    return { ok: true };
  } catch {
    return { ok: false, message: "Couldn't change that. Try again." };
  }
}
