import type { ReactNode } from "react";
import { INTAKE_COLUMN } from "../../intake/_lib/column";

/**
 * The showcase intake surface: Quiet Gilt, identical to the durable track's.
 *
 * Deliberately the same layout rather than a second opinion about it. One brand
 * runs from tayloraucoin.com through both questionnaires, and the restraint
 * here — no `RootField`, no analytics, no consent banner, no site chrome — is
 * the design, not a default. The reasoning is in
 * `app/websites/intake/layout.tsx`; it applies here unchanged (D-INT-2,
 * M-INT-10).
 *
 * This layout wraps only `/websites/coded/intake/**`. The coded-track sales
 * page above it is another thread's and keeps the full site chrome.
 */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Portfolio intake",
  // Nothing here should ever be indexed or previewed in a link unfurl.
  robots: { index: false, follow: false },
};

export default function ShowcaseIntakeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={`relative z-[2] min-h-dvh py-10 md:py-16 ${INTAKE_COLUMN}`}>
      {children}
    </div>
  );
}
