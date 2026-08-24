import { AGORA } from "@/lib/config";

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
 *
 * One link only — the sales page. Intake starts from its "Start your site"
 * button, which keeps the message out of spam filters that punish two URLs.
 */

/** Granted by the promo code; the $0 catalogue item it adds is `changes_small_promo`. */
export const INTRO_PROMO_CODE = "TAYLOR_FREE_ITERATION_ROUND";

export type IntroEmailDraft = { subject: string; body: string };

/**
 * The sales page a prospect is sent to. Not built from `lib/routes.ts` because
 * that module owns app paths and this is the marketing surface's public URL.
 */
const SALES_PATH = "/websites";

/** The promo paragraph inserted before the sign-off when the checkbox is on. */
export function introPromoParagraph(): string {
  return `\n\nQuick bonus: that includes a free small round of changes after launch — enter ${INTRO_PROMO_CODE} at the deposit step ("Have a code from our call?").`;
}

export function bodyHasIntroPromo(body: string): boolean {
  return body.includes(INTRO_PROMO_CODE);
}

export function insertIntroPromo(body: string): string {
  if (bodyHasIntroPromo(body)) return body;

  const paragraph = introPromoParagraph();
  const signOff = body.lastIndexOf("\n\n— Taylor");
  if (signOff !== -1) {
    return body.slice(0, signOff) + paragraph + body.slice(signOff);
  }

  const textMe = body.lastIndexOf("Text me at ");
  if (textMe !== -1) {
    return `${body.slice(0, textMe).trimEnd()}${paragraph}\n\n${body.slice(textMe)}`;
  }

  return body.trimEnd() + paragraph;
}

export function removeIntroPromo(body: string): string {
  const paragraph = introPromoParagraph();
  if (body.includes(paragraph)) return body.replace(paragraph, "");

  if (!bodyHasIntroPromo(body)) return body;

  // The code is still there but the surrounding words were edited — drop the
  // block from "Quick bonus:" through the line that holds the code.
  const lines = body.split("\n");
  const kept: string[] = [];
  let skipping = false;

  for (const line of lines) {
    if (line.includes("Quick bonus:")) {
      skipping = true;
      if (line.includes(INTRO_PROMO_CODE)) skipping = false;
      continue;
    }
    if (skipping) {
      if (line.includes(INTRO_PROMO_CODE)) skipping = false;
      continue;
    }
    kept.push(line);
  }

  return kept.join("\n").replace(/\n{3,}/g, "\n\n");
}

export function buildIntroEmail(input: {
  businessName: string;
  /** Empty when Taylor never caught a name — the greeting adapts. */
  firstName?: string;
  siteOrigin: string;
  includePromo: boolean;
  /**
   * The call was tagged "Talk to the boss" — the recipient is passing this
   * along, not deciding. The opening names Taylor and the reason so the
   * employee does not have to explain anything verbally.
   */
  forDecisionMaker?: boolean;
}): IntroEmailDraft {
  const origin = input.siteOrigin.replace(/\/+$/, "");
  const salesUrl = `${origin}${SALES_PATH}`;

  const greeting = input.firstName?.trim()
    ? `Hey ${input.firstName.trim()}`
    : "Hey";

  const shortVersion =
    "Short version: five pages, $1,200 + GST, half to start, you own all of it, live about a week after your answers. Built on an AI-powered platform that empowers business-owners long-term.";

  const closing =
    'When you\'re ready, the deposit and a short questionnaire (about 30 minutes) start things — it\'s on that page, behind "Start your site."';

  const promoLine = input.includePromo ? introPromoParagraph() : "";

  // The number has to be in the message. "Text me" with nothing to text is the
  // kind of small broken promise this buyer notices, and the sales page already
  // publishes it — one home, in `lib/config.ts`.
  const signOff = `Text me at ${AGORA.phone} if you have any questions.\n\n— Taylor`;

  const opening = input.forDecisionMaker
    ? `${greeting} — thanks for passing this email along on the phone.

I'm Taylor, I called about building ${input.businessName}'s website — here's everything in one place for whoever makes the call: ${salesUrl}`
    : `${greeting} — good talking today. Here's everything in one place: ${salesUrl}`;

  return {
    subject: `${input.businessName} — website info from our call`,
    body: `${opening}

${shortVersion}

${closing}${promoLine}

${signOff}`,
  };
}
