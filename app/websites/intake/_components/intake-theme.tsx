import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/**
 * Light / Dark / System for the questionnaire — the intake amendment to
 * D-ADM-13 (Taylor, 2026-09-12).
 *
 * The provider is the root layout's, shared with the whole site since the
 * rebrand (2026-10-15); this renders only the control, because the intake
 * hides the site header that carries it everywhere else.
 *
 * The control sits at the top of the column, right-aligned, above whatever
 * the route renders. The intake has no header or nav to put it in, and that
 * absence is deliberate (`app/websites/intake/layout.tsx`); a settings
 * control is not navigation, so it earns a row of its own rather than
 * reintroducing chrome. `touch` for the 48px floor this surface holds.
 *
 * Both intake layouts render this, so it is one component rather than two
 * copies of a wrapper. [ASSUMPTION: position and spacing — top-right of the
 * column, `mb-6` — reversible, chosen against the step header's `mb-8`.]
 *
 * It also holds the screen's one `main` (C-SITE-intake-coded-10): every route
 * under both intake layouts renders inside it, so no screen carries its own and
 * none goes without. The theme row stays outside it, a setting above the page.
 * Under reduced motion every transition in the frame is 0ms (D-SITE-178): the
 * site-wide rule leaves 0.01ms, so this one is scoped and wins on specificity.
 */
export function IntakeTheme({ children }: { children: ReactNode }) {
  return (
    <div className="motion-reduce:duration-0! motion-reduce:[&_*]:duration-0!">
      <div className="mb-6 flex justify-end">
        <ThemeToggle size="touch" />
      </div>
      <main id="main">{children}</main>
    </div>
  );
}
