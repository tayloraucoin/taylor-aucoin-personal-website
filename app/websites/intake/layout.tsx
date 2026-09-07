import type { Metadata } from "next";
import type { ReactNode } from "react";
import { socialCard } from "@/lib/metadata";
import { ScrollToTop } from "./_components/scroll-to-top";
import { INTAKE_COLUMN } from "./_lib/column";

/**
 * The intake surface: Quiet Gilt (UX spec §4).
 *
 * Same tokens, same ground, same mono grammar as the rest of the site — tuned
 * for a tradesperson on a phone at 9pm rather than a hiring manager on a
 * desktop.
 *
 * Three things are deliberately absent:
 *
 * No `RootField`. A recursive circuit-root canvas behind a payment form is the
 * atmosphere beating the interface, which the site's own second invariant
 * exists to prevent — and it costs mobile CPU a long form needs. Atmosphere
 * here is ground + glows + grain, all of which come from `body` in
 * globals.css.
 *
 * No analytics and no consent banner (M-INT-10). This surface carries
 * business-confidential answers; nothing third-party may see them, and with
 * nothing measured there is nothing for a banner to gate.
 *
 * No site header or footer. A form is not a page to navigate away from.
 */
export const dynamic = "force-dynamic";

/**
 * Deliberately neutral, and this covers the tokenized routes beneath it.
 *
 * `robots` keeps these out of search but cannot stop a link unfurl — Slack and
 * iMessage fetch Open Graph whatever robots says. A resume link is a URL a
 * client may well paste to their spouse or their bookkeeper, so the preview has
 * to be safe in a room nobody planned for. Without a card of its own it
 * inherited the root layout's, which announced Taylor as a senior/staff
 * engineer looking for work, mid-payment, to a paying client.
 *
 * So the card says the least true thing that is still true. No price, no
 * business name, no track, nothing about who is filling it in, and nothing
 * about Taylor's job search. The start pages inside override this with
 * something more useful, because those URLs are public and tokenless.
 */
const description = "A private questionnaire for a website build.";

export const metadata: Metadata = {
  title: "Client intake",
  description,
  robots: { index: false, follow: false },
  ...socialCard({ title: "Client intake", description }),
};

export default function IntakeLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`relative z-[2] min-h-dvh py-10 md:py-16 ${INTAKE_COLUMN}`}>
      <ScrollToTop />
      {children}
    </div>
  );
}
