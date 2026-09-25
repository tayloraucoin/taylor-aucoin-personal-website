"use server";

import { revalidatePath } from "next/cache";
import { adminRoutes } from "@/lib/routes";
import { requireAdmin } from "@/server/services/admin-auth";
import { setStepDone } from "@/server/services/pipeline";

/**
 * The pipeline on one engagement (PIPE-3): done and undo. Thin — authorise,
 * call the service (which validates), revalidate, return.
 */
export async function setStepDoneAction(input: {
  engagementId: string;
  stepId: string;
  done: boolean;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireAdmin();

  try {
    await setStepDone(input);
    revalidatePath(adminRoutes.engagement(input.engagementId));
    return { ok: true };
  } catch {
    console.error("[pipeline] set step done failed");
    return { ok: false, message: "Couldn't change that. Try again." };
  }
}
