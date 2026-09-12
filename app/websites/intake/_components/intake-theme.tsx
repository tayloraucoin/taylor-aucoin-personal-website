import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/**
 * Light / Dark / System for the questionnaire — the intake amendment to
 * D-ADM-13 (Taylor, 2026-09-12).
 *
 * The same mechanism as the admin's, mounted the same way: the provider, and
 * beside it the marker `globals.css` gates every light rule on. The two trees
 * key their choice separately (`ta-intake-theme`) because the person choosing
 * is different — this is the client's setting on the client's device.
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
 */
export function IntakeTheme({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider storageKey="ta-intake-theme">
      <div className="intake-theme contents">
        <div className="mb-6 flex justify-end">
          <ThemeToggle size="touch" />
        </div>
        {children}
      </div>
    </ThemeProvider>
  );
}
