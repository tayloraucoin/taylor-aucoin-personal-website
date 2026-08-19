import type { ReactNode } from "react";
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

export const metadata = {
  title: "Client intake",
  // Nothing here should ever be indexed or previewed in a link unfurl.
  robots: { index: false, follow: false },
};

export default function IntakeLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`relative z-[2] min-h-dvh py-10 md:py-16 ${INTAKE_COLUMN}`}>
      {children}
    </div>
  );
}
