"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * The render id last mounted at each pathname, for the life of this document.
 *
 * Module state on purpose: the client router cache this guards against is
 * itself in-memory per document, so the two share exactly one lifetime. A
 * full reload clears both, which is the one case where a repeated id is not a
 * repeated render.
 */
const mountedAt = new Map<string, string>();

/** Where the guard last mounted, so a remount in place is never read as a return. */
let lastPathname: string | null = null;

/**
 * Refreshes a step that Next has rendered from a stale client-side snapshot.
 *
 * Every step route is dynamic and has no `loading.tsx`. That combination has a
 * consequence in the Next 15.5 router: a `<Link>` prefetch for such a route
 * returns the route tree with no rendered components, and a navigation that
 * uses that prefetch for the first time leaves the client cache untouched
 * (`applyFlightData` returns false on null seed data). The first visit is
 * fine — nothing is cached, so the page is fetched lazily. But the fetched
 * node is retained, prefetch entries expire after five minutes, and a return
 * to the step after that mints a new entry, takes the same "first use" path,
 * and renders the retained node from the earlier visit. No request is made.
 * Browser back/forward restores from the cache regardless of age. Either way
 * a client sees the step as it was before their last answers, and only a
 * reload fixes it (Kryshan, 2026-09-11: notes and ratings on the taste step
 * gone after a trip back to the work step).
 *
 * The detector needs no clock and no storage: a server render is stamped with
 * a fresh id by `StepShell`, and a stale render is the same id mounting again
 * at the same pathname after the guard has been somewhere else. A refresh then
 * fetches the tree for real, and the shell keys the step body by the id so the
 * fresh render also re-seeds the form rather than being reconciled into stale
 * client state.
 *
 * Why not `prefetch={false}` on every link into a step: it is a promise every
 * future link has to keep, and it does nothing for back/forward. This is one
 * mechanism in one place, and a link added anywhere is covered.
 *
 * Nothing in the intake tree remounts the shell at the same pathname without
 * navigating, so `lastPathname` only ever blocks the one false positive that
 * exists: React's development double-mount.
 */
export function RefreshIfStale({ renderId }: { renderId: string }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stale =
      mountedAt.get(pathname) === renderId && lastPathname !== pathname;

    lastPathname = pathname;
    mountedAt.set(pathname, renderId);

    if (stale) router.refresh();
  }, [pathname, renderId, router]);

  return null;
}
