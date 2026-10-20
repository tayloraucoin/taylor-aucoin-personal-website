"use client";

import { useEffect } from "react";

const SECTIONS = ["teaching", "tools", "testimonials"];

/**
 * Landing at `#teaching`, `#tools` or `#testimonials` gives the section's h2
 * focus (D-SITE-73); the section's scroll margin keeps it clear of the header.
 */
export function AnchorFocus() {
  useEffect(() => {
    const land = () => {
      const id = window.location.hash.slice(1);
      if (!SECTIONS.includes(id)) return;
      document
        .getElementById(id)
        ?.querySelector<HTMLElement>("h2")
        ?.focus({ preventScroll: true });
    };
    land();
    window.addEventListener("hashchange", land);
    return () => window.removeEventListener("hashchange", land);
  }, []);
  return null;
}
