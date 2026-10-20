import type { ReactNode } from "react";
import { IntakeTheme } from "@/app/websites/intake/_components/intake-theme";
import { INTAKE_COLUMN } from "@/app/websites/intake/_lib/column";

/**
 * The intake's own frame for its harness: the column, the theme group and the
 * one `main`, as both intake layouts render them. `isIntakePath` covers this
 * path, so the site's chrome and analytics stand down here as on an intake.
 */
export const dynamic = "force-dynamic";

export const metadata = { robots: { index: false, follow: false } };

export default function IntakeHarnessLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={`relative z-[2] min-h-dvh py-10 md:py-16 ${INTAKE_COLUMN}`}>
      <IntakeTheme>{children}</IntakeTheme>
    </div>
  );
}
