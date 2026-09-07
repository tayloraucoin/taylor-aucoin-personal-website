"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Puts every intake route at the top when it arrives.
 *
 * Each step is its own route, so a client who scrolled to the bottom of a long
 * step to reach Continue landed halfway down the next one — reading its middle
 * before its question. Next's own scroll handling does not fire here reliably,
 * and the flow has nothing worth preserving a scroll position for: a step is
 * read from its heading down.
 *
 * Instant rather than smooth on purpose. A scrolling animation between two
 * screens reads as the page moving under someone who has just clicked, and
 * `prefers-reduced-motion` would have to undo it anyway.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
