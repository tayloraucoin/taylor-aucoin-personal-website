"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { intakeRoutes } from "@/lib/routes";
import { startIntakeInput } from "@/lib/validators/intake";
import { sendResumeLink } from "@/server/services/emails";
import {
  buildIntakeUrl,
  createEngagement,
  findResumableByEmail,
} from "@/server/services/engagement";
import { saveStepAnswers } from "@/server/services/submission";

export type StartResult = { error: string } | never;

/** Lets a client return to the start page on the same device and pick up. */
const RESUME_COOKIE = "ta_intake";
const RESUME_COOKIE_MAX_AGE = 60 * 60 * 24 * 60;

/**
 * Creates an engagement from the public start form.
 *
 * This is the moment a client becomes a client. There is no token beforehand —
 * their own submission mints one — so a single stable link (`/websites/intake`)
 * is all
 * that ever needs sending, and no engagement has to be provisioned by hand.
 *
 * The token then reaches them three ways, because losing it means losing them:
 * the redirect they are already following, a cookie for the same device, and
 * an email for every other device. Only the hash is stored, so a lost link can
 * be re-issued but never recovered.
 */
export async function startIntake(formData: FormData): Promise<StartResult> {
  const parsed = startIntakeInput.safeParse({
    businessName: formData.get("businessName"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone") || undefined,
    whatYouDo: formData.get("whatYouDo") || undefined,
    googleMapsUrl: formData.get("googleMapsUrl") || undefined,
    currentWebsite: formData.get("currentWebsite") || undefined,
    website: formData.get("website") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  // A filled honeypot is a bot. Answer as though it worked rather than
  // explaining the trap.
  if (parsed.data.website) redirect("/");

  const existing = await findResumableByEmail(parsed.data.contactEmail);

  if (existing?.token) {
    // They have started before and not finished. Put them back rather than
    // creating a second engagement and a second deposit to reconcile.
    await setResumeCookie(existing.token);
    redirect(intakeRoutes.entry(existing.token));
  }

  const { engagement, token } = await createEngagement({
    businessName: parsed.data.businessName,
    contactName: parsed.data.contactName,
    contactEmail: parsed.data.contactEmail,
    contactPhone: parsed.data.contactPhone,
    currency: "cad",
    depositRequired: true,
  });

  // What they typed is already an answer — seeding it means Step 1 opens
  // filled in rather than asking again.
  await saveStepAnswers(token, "business", {
    businessName: parsed.data.businessName,
    contactName: parsed.data.contactName,
    contactEmail: parsed.data.contactEmail,
    contactPhone: parsed.data.contactPhone,
    whatYouDo: parsed.data.whatYouDo,
  });

  if (parsed.data.currentWebsite || parsed.data.googleMapsUrl) {
    await saveStepAnswers(token, "access", {
      existingWebsite: parsed.data.currentWebsite,
      googleMapsUrl: parsed.data.googleMapsUrl,
    });
  }

  await setResumeCookie(token);

  // Best effort: they are about to be redirected there anyway, and a failed
  // send must not cost them the engagement they just created.
  void sendResumeLink(engagement, buildIntakeUrl(token)).catch(() => {});

  redirect(intakeRoutes.entry(token));
}

async function setResumeCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(RESUME_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: intakeRoutes.cookiePath,
    maxAge: RESUME_COOKIE_MAX_AGE,
  });
}

/** The token this browser last started, if any. Read by the start page. */
export async function readResumeCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(RESUME_COOKIE)?.value ?? null;
}
