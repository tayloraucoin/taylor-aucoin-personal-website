"use client";

import { track } from "@/lib/analytics/events";

/** Calls the real seam, never gtag directly, so the spec sees what ships. */
export function TrackButton() {
  return (
    <button
      type="button"
      onClick={() =>
        track("book_call_click", { surface: "home", placement: "hero" })
      }
    >
      Track
    </button>
  );
}
