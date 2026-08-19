"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isIntakePath } from "@/lib/routes";

/**
 * Hides the site's chrome on the client-intake surface.
 *
 * A nav bar offering "Work with me" partway through a paid client's
 * questionnaire is an exit they do not need and a register that does not match
 * the screen. The intake flow is a single focused column with one path
 * forward.
 *
 * This is a client gate rather than a route group because moving every
 * marketing page into `app/(site)/` would touch the parallel `@modal` routes
 * that the case-study overlays depend on — a large blast radius for a header.
 * The route-group version is the tidier end state if the intake surface ever
 * grows more of its own chrome.
 */
export default function SiteChrome({ children }: { children: ReactNode }) {
  return isIntakePath(usePathname()) ? null : <>{children}</>;
}
