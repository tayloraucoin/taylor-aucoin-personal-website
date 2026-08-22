"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { adminRoutes } from "@/lib/routes";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "./ui/sheet";

/**
 * The lead record, over whatever you were doing.
 *
 * A drawer rather than a page because looking someone up is an aside: from the
 * leads list you are scanning, and from the queue you are mid-call block. Both
 * want the record without losing their place.
 *
 * Open state lives in the URL (`?lead=<id>`), so the back button closes it, a
 * refresh keeps it, and a link to it can be pasted. Closing strips only that
 * parameter — filters and how far you scrolled the fresh band survive.
 */
export function LeadDrawer({
  leadId,
  children,
}: {
  leadId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const closeHref = (() => {
    const next = new URLSearchParams(params.toString());
    next.delete("lead");
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  })();

  /**
   * This page is a Server Component reading `?lead=` — the instant the URL
   * loses that param, the parent stops rendering `<LeadDrawer>` at all and
   * React unmounts it in the same commit. Navigating the moment the user
   * asks to close would yank the panel out from under its own exit
   * animation. So closing goes through local state first: `open` flips to
   * false, Radix keeps the panel mounted and plays `sheet-slide-out`, and
   * only that animation's own `animationend` triggers the URL change. Esc,
   * an overlay click, and the Close button all route through the same
   * `onOpenChange`, so all three animate identically.
   *
   * The browser's back/forward buttons bypass this entirely and close the
   * drawer instantly — intercepting `popstate` to animate a back-navigation
   * would fight the browser's own history contract for a cosmetic gain.
   * Logged (CRM-13).
   */
  const [open, setOpen] = useState(true);

  const close = useCallback(() => setOpen(false), []);

  const navigateAway = useCallback(() => {
    router.push(closeHref, { scroll: false });
  }, [router, closeHref]);

  return (
    <Sheet open={open} onOpenChange={(next) => !next && close()}>
      <SheetContent
        aria-describedby={undefined}
        onAnimationEnd={(event) => {
          // A future child animation bubbling up must never trigger a
          // navigation the panel's own exit animation didn't ask for.
          if (event.target === event.currentTarget && !open) navigateAway();
        }}
      >
        <SheetTitle className="sr-only">Lead record</SheetTitle>

        <div className="mb-4 flex items-center justify-between gap-4">
          {/* The escape hatch: same record, its own URL, for a second tab or a
              paste into a message. */}
          <Link
            href={adminRoutes.lead(leadId)}
            className="min-h-[44px] px-2 py-2.5 text-sm text-(--color-dim) underline"
          >
            Open full page
          </Link>

          <SheetClose className="min-h-[44px] px-2 py-2.5 text-sm text-(--color-dim) underline">
            Close
          </SheetClose>
        </div>

        {children}
      </SheetContent>
    </Sheet>
  );
}
