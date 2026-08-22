import { intakeRoutes } from "@/lib/routes";

/**
 * The text version of the intro, composed here and nowhere else.
 *
 * Server-composed for the same reason as the email (M-CRM-9): the origin
 * comes from the environment rather than `window.location`, so a message
 * drafted while running locally can never send a prospect a localhost link.
 *
 * **The app never sends this** (D-CRM-14). It hands the words to Taylor's own
 * phone via an `sms:` link, or to his clipboard on a laptop. What the CRM
 * records is that a link was prepared and taken to the phone — never that it
 * was delivered, which only the phone knows.
 *
 * Register per Drummer: shorter than the email because a text that scrolls
 * gets skimmed. One link, one line of context, no exclamation marks. The
 * number is deliberately absent — it arrives from Taylor's own phone, so
 * saying "text me at…" would be telling someone their own caller ID.
 */

const SALES_PATH = "/websites";

export function buildIntroText(input: {
  /** Empty when Taylor never caught a name — the greeting adapts. */
  firstName?: string;
  siteOrigin: string;
  includePromo: boolean;
}): string {
  const origin = input.siteOrigin.replace(/\/+$/, "");
  const salesUrl = `${origin}${SALES_PATH}`;

  const greeting = input.firstName?.trim()
    ? `${input.firstName.trim()} — `
    : "";

  const startUrl = input.includePromo
    ? `${origin}${intakeRoutes.start}?promo=TAYLOR_FREE_ITERATION_ROUND`
    : "";

  const promoLine = startUrl
    ? `\n\nWhen you're ready, this starts it and includes a free small round of changes after launch, from our call: ${startUrl}`
    : "";

  return `${greeting}Taylor here, from the call just now. Here's that link: ${salesUrl}

Prices are on there too — no surprises. Text me back if anything's off.${promoLine}`;
}
