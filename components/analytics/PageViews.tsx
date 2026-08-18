"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";

/**
 * Sends `page_view` on client-side navigation.
 *
 * `@next/third-parties` emits only `gtag('js')` + `gtag('config')` — the exact
 * snippet from the GA console, with no router integration. That covers the
 * first page and nothing after it. GA4's Enhanced Measurement can catch the
 * rest via history events, but it reads `document.title` while the history
 * entry is changing, which in the App Router is *before* React has committed
 * the new title — so navigations land with the previous page's title against
 * the new URL. Measured on this site: pushState to /services fires while the
 * title is still "Taylor Aucoin — Senior/staff product engineer".
 *
 * Firing from an effect instead means the commit has already happened and
 * title and location agree.
 *
 * REQUIRES: "Page changes based on browser history events" must be OFF in
 * GA4 (Admin → Data Streams → Enhanced Measurement → gear). With both on,
 * every navigation counts twice.
 *
 * Deliberately no `useSearchParams()`: in the root layout it demands a Suspense
 * boundary and pushes the subtree to client rendering, which would undo the
 * static generation the middleware approach exists to protect. Query strings
 * still reach GA inside `page_location`; a query-only change just doesn't
 * re-fire, and nothing on this site routes on query params.
 */
export default function PageViews() {
  const pathname = usePathname();

  // The path GA loaded on, which gtag('config') has already counted. Seeding
  // the ref with it (rather than tracking "have I run yet" as a boolean) is
  // what makes this correct under React Strict Mode: dev double-invokes
  // effects on mount, and a boolean guard flips on the first pass and then
  // fires a duplicate page_view on the second. Comparing paths cannot.
  const reported = useRef(pathname);

  useEffect(() => {
    if (reported.current === pathname) return;
    reported.current = pathname;

    sendGAEvent("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}
