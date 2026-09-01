"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { showcaseIntakeRoutes } from "@/lib/routes";
import { startShowcaseIntakeInput } from "@/lib/validators/showcase-intake";
import { sendResumeLink } from "@/server/services/emails";
import {
  buildShowcaseIntakeUrl,
  createEngagement,
  findResumableByEmail,
} from "@/server/services/engagement";
import { saveStepAnswers } from "@/server/services/submission";

export type StartResult = { error: string } | never;

/**
 * The showcase track's own resume cookie.
 *
 * A separate name and a narrower path than the durable track's: one token is
 * one engagement on one track, and a browser that has started both should
 * never send either token to the other tree.
 */
const RESUME_COOKIE = "ta_coded_intake";
const RESUME_COOKIE_MAX_AGE = 60 * 60 * 24 * 60;

/**
 * Creates a showcase engagement from the public start form.
 *
 * Mirrors the durable track's `startIntake` deliberately — same three ways of
 * getting the token to the client (redirect, cookie, email), same resume-rather
 * -than-duplicate rule, same honeypot handling. What differs is the track it
 * stamps and where the answers land.
 *
 * `businessName` carries the client's own name here. The column is notNull and
 * a creative's practice is usually themselves; asking separately for a
 * "business name" would be asking for the same string twice (D-INT-8, M-PORT-3).
 */
export async function startShowcaseIntake(
  formData: FormData,
): Promise<StartResult> {
  const parsed = startShowcaseIntakeInput.safeParse({
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone") || undefined,
    whatYouDo: formData.get("whatYouDo") || undefined,
    siteKinds: formData.getAll("siteKinds").map(String),
    disciplines: formData.getAll("disciplines").map(String),
    siteKindsOther: formData.get("siteKindsOther") || undefined,
    disciplinesOther: formData.get("disciplinesOther") || undefined,
    currentWebsite: formData.get("currentWebsite") || undefined,
    website: formData.get("website") || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form.",
    };
  }

  // A filled honeypot is a bot. Answer as though it worked rather than
  // explaining the trap.
  if (parsed.data.website) redirect("/");

  const promo = String(formData.get("promo") ?? "").trim();
  const withPromo = (path: string) =>
    promo ? `${path}?promo=${encodeURIComponent(promo)}` : path;

  const existing = await findResumableByEmail(parsed.data.contactEmail);

  // Only a showcase engagement is resumable from here. Someone who bought a
  // platform site last year and is now buying a coded one is starting a
  // genuinely new engagement, not returning to their old one.
  if (existing?.token && existing.engagement.track === "showcase") {
    await setResumeCookie(existing.token);
    redirect(withPromo(showcaseIntakeRoutes.entry(existing.token)));
  }

  const { engagement, token } = await createEngagement({
    businessName: parsed.data.contactName,
    contactName: parsed.data.contactName,
    contactEmail: parsed.data.contactEmail,
    contactPhone: parsed.data.contactPhone,
    currency: "cad",
    depositRequired: true,
    track: "showcase",
  });

  // What they typed is already an answer — seeding it means step 1 opens
  // filled in rather than asking again. Contact identity is not seeded: it
  // lives on the engagement's own columns and step 1 renders it from there.
  await saveStepAnswers(token, "about", {
    whatYouDo: parsed.data.whatYouDo,
    siteKinds: parsed.data.siteKinds,
    disciplines: parsed.data.disciplines,
    siteKindsOther: parsed.data.siteKindsOther,
    disciplinesOther: parsed.data.disciplinesOther,
    currentWebsite: parsed.data.currentWebsite,
  });

  await setResumeCookie(token);

  // Best effort: they are about to be redirected there anyway, and a failed
  // send must not cost them the engagement they just created.
  void sendResumeLink(engagement, buildShowcaseIntakeUrl(token)).catch(() => {});

  redirect(withPromo(showcaseIntakeRoutes.entry(token)));
}

async function setResumeCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(RESUME_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: showcaseIntakeRoutes.cookiePath,
    maxAge: RESUME_COOKIE_MAX_AGE,
  });
}

/** The token this browser last started here, if any. Read by the start page. */
export async function readShowcaseResumeCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(RESUME_COOKIE)?.value ?? null;
}
