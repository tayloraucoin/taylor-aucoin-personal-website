import type { Engagement } from "@/server/services/engagement";
import type { IntakeTrackKey } from "@/lib/types/intake";

/**
 * A blank engagement, so the pre-questionnaire screens have something to render
 * against.
 *
 * The pay and welcome screens read an engagement row for a handful of display
 * values — name, business, project summary, currency, track, paid state. There
 * is no engagement behind a preview, so this supplies the shape and nothing
 * else: empty strings rather than a sample client, per
 * `docs/intake/ADMIN-HANDOFF.md`, which treats invented client data as a legal
 * posture and not a style note.
 *
 * **Prices do not come from here.** They come from the real product catalogue,
 * read live, so the pay screen quotes what a client would actually be quoted.
 * Inventing a number on a money screen is the one thing this file must not do.
 */
export function previewEngagement(track: IntakeTrackKey): Engagement {
  const epoch = new Date(0);

  return {
    id: "",
    createdAt: epoch,
    updatedAt: epoch,
    answers: {},
    businessName: "",
    completedAt: null,
    contactEmail: "",
    contactName: "",
    contactPhone: null,
    currency: "cad",
    currentStep: 0,
    depositAmountCents: 0,
    depositRequired: true,
    lastActivityAt: epoch,
    paidAt: null,
    projectSummary: null,
    sentAt: null,
    startedAt: null,
    termsAcceptedAt: null,
    termsVersion: null,
    tokenExpiresAt: epoch,
    track,
    status: "created",
  };
}
