"use client";

import type { ReactNode } from "react";
import { useIsDocument } from "@/components/intake/preview-mode";
import type { RevealCondition } from "@/lib/intake/reveal-condition";

/**
 * A follow-up question that only appears once something above it is answered.
 *
 * **In a document nobody can click, a closed reveal is a question missing from
 * the review** — the one defect the review surface cannot have (ADM-2 § Failure
 * states). So this wrapper renders its children conditionally on a client's
 * screen and unconditionally in document mode, under a line naming what opens
 * them.
 *
 * The condition itself is structured data and lives in
 * `lib/intake/reveal-condition.ts`, which records why (D-ADM-10). This file
 * owns the two things done with it: deciding the branch, and generating the
 * document's line from the same value the branch was decided by.
 *
 * ## The interface path emits nothing
 *
 * No wrapper element, no fragment with attributes — `children` or `null`,
 * exactly as the ternary it replaces did. The client route's rendered DOM is
 * unchanged by wrapping a branch in this (ADM-4 Acceptance 4).
 */

/**
 * Re-exported so every existing consumer keeps its import path. The type moved
 * to `lib/intake/reveal-condition.ts` when add-on copy needed to carry one; see
 * that file for why it could not stay here.
 */
export type { RevealCondition };

function isVisible(
  condition: RevealCondition,
  values: Record<string, unknown>,
  extras: readonly string[],
): boolean {
  if ("extra" in condition) return extras.includes(condition.extra);

  const value = values[condition.field];

  if ("equals" in condition) return value === condition.equals;
  if ("in" in condition) {
    return typeof value === "string" && condition.in.includes(value);
  }
  return Array.isArray(value) && value.includes(condition.includes);
}

/**
 * The document's one-line explanation, generated from the condition itself.
 *
 * Field keys and stored values only — never a label. A reviewer reading
 * `Shown when ownsDomain = "yes"` is reading the same two facts the branch is
 * decided by, and the key is the handle they will use when codifying anyway.
 */
function describe(condition: RevealCondition): string {
  if ("extra" in condition) {
    return `Shown when the ${condition.extra} add-on was purchased`;
  }
  if ("equals" in condition) {
    return `Shown when ${condition.field} = "${condition.equals}"`;
  }
  if ("in" in condition) {
    const values = condition.in.map((value) => `"${value}"`).join(" or ");
    return `Shown when ${condition.field} is ${values}`;
  }
  return `Shown when ${condition.field} includes "${condition.includes}"`;
}

export function Reveal({
  dependsOn,
  values = {},
  extras = [],
  children,
}: Readonly<{
  dependsOn: RevealCondition;
  /** The step's autosaved answers. Omitted only for an `extra` condition. */
  values?: Record<string, unknown>;
  /** What the client bought. Omitted for every answer-driven condition. */
  extras?: readonly string[];
  children: ReactNode;
}>) {
  if (useIsDocument()) {
    return (
      <div className="mb-8 border-l border-(--color-faint) pl-5">
        <p
          data-md="condition"
          className="mb-3 font-mono text-[10px] tracking-[.12em] text-(--color-dim)"
        >
          {describe(dependsOn)}
        </p>
        {children}
      </div>
    );
  }

  return isVisible(dependsOn, values, extras) ? <>{children}</> : null;
}
