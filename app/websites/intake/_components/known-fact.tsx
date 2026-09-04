"use client";

import type { ReactNode } from "react";
import { useIsDocument } from "@/components/intake/preview-mode";
import { DocTag } from "./document";

/**
 * One fact we already hold, rendered as a fact rather than as an empty box.
 *
 * The grammar of D-INT-8: a client is never asked for something the system
 * already knows. A mono label, the value in ink, and an optional action beside
 * it for the few facts a client may change themselves.
 *
 * Extracted from the coded track's step 1 at PORT-13, when it gained a third
 * consumer — the contact lines, the kind line, and PORT-14's summary rows. The
 * durable track does not import it and is unaffected by the move.
 *
 * **A client component since ADM-4**, so it can read the render mode. Its
 * importers were already client leaves.
 */
export function KnownFact({
  label,
  value,
  action,
}: {
  label: string;
  value: string | null;
  /** A text link beside the value — "Change", and nothing louder. */
  action?: ReactNode;
}) {
  /**
   * In a document this is the one thing worth saying about the row: it looks
   * like a question and is not one. The value is empty in preview (there is no
   * engagement), and the action is a control, so neither is rendered — the tag
   * and the label are the whole fact.
   */
  if (useIsDocument()) {
    return (
      <div className="mb-4">
        <h3
          data-md="question"
          className="font-body text-[16px] font-medium leading-[1.4] text-(--color-ink)"
        >
          {label}
        </h3>
        <div className="mt-1">
          <DocTag>Shown, not asked</DocTag>
        </div>
      </div>
    );
  }

  return (
    <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-body text-[16px] font-light leading-[1.4] text-(--color-ink)">
      <span className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
        {label}
      </span>
      {value ?? "—"}
      {action}
    </p>
  );
}
