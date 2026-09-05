"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/app/admin/_components/ui/sheet";

/**
 * A site's editor, over the list.
 *
 * A drawer rather than a second page, for the reason `LeadDrawer` is one:
 * editing a site is an aside from the list you are working down, and the list
 * is where you know what is left. The first cut sent you to `/sites/<slug>` and
 * back for every action, which is why publishing a set felt like forty errands.
 *
 * Open state lives in the URL (`?site=<slug>` / `?preview=`), so the back
 * button closes it, a refresh keeps it, and a link to one site can be pasted.
 * Closing strips only those parameters.
 *
 * The close dance is `LeadDrawer`'s, verbatim and for its reason: the parent is
 * a Server Component reading the query string, so the instant the URL loses the
 * parameter React unmounts this in the same commit — navigating when the user
 * asks to close would yank the panel out from under its own exit animation. So
 * `open` flips false first, Radix plays `sheet-slide-out`, and only that
 * animation's own `animationend` changes the URL. The `event.target ===
 * event.currentTarget` guard is load-bearing: a child animation bubbling up
 * must never trigger a navigation the panel's exit did not ask for.
 */
export function SiteDrawer({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(true);

  const closeHref = (() => {
    const next = new URLSearchParams(params.toString());
    next.delete("site");
    next.delete("preview");
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  })();

  const close = useCallback(() => setOpen(false), []);
  const navigateAway = useCallback(() => {
    router.push(closeHref, { scroll: false });
  }, [router, closeHref]);

  return (
    <Sheet open={open} onOpenChange={(next) => !next && close()}>
      <SheetContent
        size="wide"
        aria-describedby={undefined}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && !open) navigateAway();
        }}
      >
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-(--color-faint) pb-4">
          <SheetTitle className="font-(family-name:--font-display) text-lg text-(--color-ink)">
            {title}
          </SheetTitle>
          <SheetClose className="min-h-[44px] px-2 py-2.5 text-sm text-(--color-dim) underline underline-offset-4 hover:text-(--color-ink)">
            Close
          </SheetClose>
        </div>

        {children}
      </SheetContent>
    </Sheet>
  );
}
