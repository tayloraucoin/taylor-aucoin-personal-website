import { AGORA } from "@/lib/config";
import { intakeRoutes } from "@/lib/routes";

/**
 * The intro email Taylor sends after a call, drafted here and nowhere else.
 *
 * One home for the words: the dialog shows exactly what the send will use, so
 * the preview cannot drift from the message. Taylor edits freely on top of it
 * and what he edits is what goes out and what gets stored.
 *
 * Register per Drummer: plain, warm, priced, one ask, no exclamation marks
 * doing the enthusiasm's job. Every claim is checkable in under a minute —
 * the price is the published price, the link is the live site — because this
 * buyer will check.
 */

/** Granted by the promo code; the $0 catalogue item it adds is `changes_small_promo`. */
export const INTRO_PROMO_CODE = "TAYLOR_FREE_ITERATION_ROUND";

export type IntroEmailDraft = { subject: string; body: string };

/**
 * The sales page a prospect is sent to. Not built from `lib/routes.ts` because
 * that module owns app paths and this is the marketing surface's public URL.
 */
const SALES_PATH = "/websites";

export function buildIntroEmail(input: {
  businessName: string;
  /** Empty when Taylor never caught a name — the greeting adapts. */
  firstName?: string;
  siteOrigin: string;
  includePromo: boolean;
}): IntroEmailDraft {
  const origin = input.siteOrigin.replace(/\/+$/, "");
  const salesUrl = `${origin}${SALES_PATH}`;

  const intakeUrl = input.includePromo
    ? `${origin}${intakeRoutes.start}?promo=${INTRO_PROMO_CODE}`
    : `${origin}${intakeRoutes.start}`;

  const greeting = input.firstName?.trim()
    ? `Hey ${input.firstName.trim()}`
    : "Hey";

  const promoLine = input.includePromo
    ? "\n\nThat link includes a free small round of changes after launch, from our call."
    : "";

  // The number has to be in the message. "Text me" with nothing to text is the
  // kind of small broken promise this buyer notices, and the sales page already
  // publishes it — one home, in `lib/config.ts`.
  const signOff = `Text me at ${AGORA.phone} if anything's weird.\n\n— Taylor`;

  return {
    subject: `${input.businessName} — website info from our call`,
    body: `${greeting} — good talking today. Here's everything in one place: ${salesUrl}

Short version: five pages, $1,200 + GST, half to start, you own all of it, live about a week after your answers.

When you're ready, this link starts things — the deposit and a short questionnaire (about 30 minutes): ${intakeUrl}${promoLine}

${signOff}`,
  };
}
