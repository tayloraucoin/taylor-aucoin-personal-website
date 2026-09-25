"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { adminRoutes } from "@/lib/routes";
import type { SendStepEmailInput } from "@/lib/validators/pipeline";
import { requireAdmin } from "@/server/services/admin-auth";
import { sendStepEmail } from "@/server/services/emails";
import { setStepDone } from "@/server/services/pipeline";

/**
 * The pipeline on one engagement: done and undo (PIPE-3), and a step's email
 * (PIPE-4). Thin — authorise, call the service (which validates and decides),
 * revalidate, return.
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

/**
 * Sends one step's email. Every law — the address, the placeholder refusal,
 * the row before the send — lives in `sendStepEmail`; this only reports.
 */
export async function sendStepEmailAction(
  input: SendStepEmailInput,
): Promise<
  { ok: true; to: string; note: string | null } | { ok: false; message: string }
> {
  await requireAdmin();

  try {
    const result = await sendStepEmail(input);
    revalidatePath(adminRoutes.engagement(input.engagementId));
    return result;
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: error.issues[0]?.message ?? "Check the email.",
      };
    }
    console.error("[pipeline] send action failed");
    return {
      ok: false,
      message: "The email didn't send. Your letter is still here — try again.",
    };
  }
}
