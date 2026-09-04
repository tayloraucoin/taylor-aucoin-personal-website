"use client";

import { useEffect, useState } from "react";
import { CALL_SOP } from "@/lib/crm/sop";
import { Markup } from "./markup";

/**
 * How to work the queue, one click from the queue.
 *
 * A dialog rather than a page: it is read beside the work, often mid-call, and
 * navigating away from a call block to read the manual is exactly when nobody
 * reads the manual.
 *
 * The renderer (`./markup`) handles the small subset of markdown these
 * operator documents use — headings, bold, code, rules, lists, blockquotes,
 * tables, paragraphs — shared with the call sheet (CRM-17). A markdown
 * library for two in-house documents would be a dependency to maintain
 * forever to save a couple hundred lines.
 */
export function SopDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-[44px] rounded-(--radius) border border-(--color-line-strong) px-3 text-sm text-(--color-body) hover:text-(--color-ink)"
      >
        How to work the queue
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:p-8">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="How to work the queue"
            className="w-full max-w-2xl rounded-(--radius) border border-(--color-line) bg-(--color-ground-a) p-6"
          >
            <div className="mb-5 flex items-baseline justify-between gap-4">
              <h2 className="font-(family-name:--font-display) text-lg text-(--color-ink)">
                How to work the queue
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-[44px] text-sm text-(--color-dim) underline"
              >
                Close
              </button>
            </div>

            <Markup source={CALL_SOP} />
          </div>
        </div>
      ) : null}
    </>
  );
}
