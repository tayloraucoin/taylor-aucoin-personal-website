import type { ReactNode } from "react";
import { INTAKE_COLUMN } from "@/app/websites/intake/_lib/column";
import { requireAdmin } from "@/server/services/admin-auth";

/**
 * The admin tree's other layout: authenticated, and otherwise not admin at all.
 *
 * `(protected)` wraps its pages in `AdminShell` — the rail, the header, the
 * theme toggle. That is right for reading the flow and wrong for judging one
 * screen, because every one of those elements is chrome a client will never
 * see, and the question this surface answers is how the screen feels to be
 * handed (Taylor, 2026-09-04: "I just want to feel like a user").
 *
 * So the group exists to *not* mount the shell, and the guard moves here
 * instead. `requireAdmin` is the same call `(protected)` makes: the gate
 * follows the surface, never the folder (M-CRM-1).
 *
 * The column is the intake's own, imported rather than restated, so a change
 * to the client's measure reaches this preview without anyone remembering to
 * copy it.
 */
export const dynamic = "force-dynamic";

export default async function ClientPreviewLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  await requireAdmin();

  return (
    <div className={`relative z-[2] min-h-dvh py-10 md:py-16 ${INTAKE_COLUMN}`}>
      {children}
    </div>
  );
}
