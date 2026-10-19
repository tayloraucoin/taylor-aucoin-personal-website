"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { setStrippedPage } from "@/lib/analytics/events";
import { stripQuery } from "@/lib/analytics/location";

type Gtag = (...args: unknown[]) => void;
type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: Gtag };

/**
 * The gtag queue, defined here rather than in an inline script so it exists
 * before this component's first effect, whatever order the scripts land in.
 * gtag.js drains `dataLayer` when it arrives. The config sends no page view:
 * this component sends every one itself, `q` stripped (D-SITE-226).
 */
function ensureGtag(gaId: string): Gtag {
  const w = window as GtagWindow;
  if (w.gtag) return w.gtag;
  w.dataLayer = w.dataLayer ?? [];
  w.gtag = function gtag() {
    // gtag.js reads the `arguments` object itself, never an array copy.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", gaId, { send_page_view: false });
  return w.gtag;
}

/**
 * Sends `page_view` for the first page and each client navigation.
 *
 * Firing from an effect means React has committed the new title, so title and
 * location agree (GA4's history-event page views read the previous title, so
 * that setting must stay OFF in GA4, or every navigation counts twice).
 *
 * Before each hit, `page_location` and `page_referrer` are set with `q`
 * removed: gtag.js reads the live URL and `document.referrer` otherwise, and
 * the referrer of a client navigation is still the first page's.
 *
 * The ref starts at null so the first page view is sent too, and compares
 * paths rather than flipping a boolean, so React Strict Mode's double effect
 * cannot send a duplicate. No `useSearchParams()`: in the root layout it would
 * push the subtree to client rendering; a query-only change does not re-fire.
 */
export default function PageViews({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const reported = useRef<string | null>(null);

  useEffect(() => {
    if (reported.current === pathname) return;
    reported.current = pathname;

    const gtag = ensureGtag(gaId);
    setStrippedPage(gtag);
    gtag("event", "page_view", {
      page_title: document.title,
      page_location: stripQuery(window.location.href),
      page_referrer: stripQuery(document.referrer),
    });
  }, [gaId, pathname]);

  return null;
}
