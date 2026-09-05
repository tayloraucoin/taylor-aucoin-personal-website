import type { Engagement } from "@/server/services/engagement";
import type { ShowcaseKind } from "@/lib/intake/showcase-kinds";
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
 *
 * The two `about` answers are the exception to "empty everything", and they are
 * not client data: they are the reviewer's own choice from the rail, written
 * where the pack resolver reads it. Without them every screen above the
 * questionnaire resolves to the generic pack, so previewing a filmmaker showed
 * a welcome screen listing a consultant's step names while the questionnaire
 * below it listed the right ones.
 */
export function previewEngagement(
  track: IntakeTrackKey,
  view?: Readonly<{ kind: ShowcaseKind; disciplines?: readonly string[] }>,
): Engagement {
  const epoch = new Date(0);

  return {
    id: "",
    createdAt: epoch,
    updatedAt: epoch,
    answers: view
      ? {
          about: {
            siteKind: view.kind,
            ...(view.disciplines ? { disciplines: [...view.disciplines] } : {}),
          },
        }
      : {},
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
