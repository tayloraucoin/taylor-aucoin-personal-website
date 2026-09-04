"use client";

import type { ReactNode } from "react";
import { useIsDocument } from "@/components/intake/preview-mode";

/**
 * A follow-up question that only appears once something above it is answered.
 *
 * **In a document nobody can click, a closed reveal is a question missing from
 * the review** — the one defect the review surface cannot have (ADM-2 § Failure
 * states). So this wrapper renders its children conditionally on a client's
 * screen and unconditionally in document mode, under a line naming what opens
 * them.
 *
 * ## Why the condition is data and not a sentence
 *
 * The obvious API is a `when` boolean plus a hand-written `shownWhen` string
 * for the document to print. It was rejected (D-ADM-10). That string would be a
 * question's label and an option's label typed a second time, in a production
 * component — which breaks the one law this whole surface exists to keep
 * (D-ADM-6, and ADM-2's "no question's words in any file this ticket adds") —
 * and, worse, it would be a second copy of the condition that can silently
 * disagree with the first.
 *
 * So `dependsOn` is structured, this component evaluates it, and the document
 * line is generated from the same data the branch is decided by. There is
 * exactly one source of truth per reveal, and it is machine-checkable.
 *
 * ## The interface path emits nothing
 *
 * No wrapper element, no fragment with attributes — `children` or `null`,
 * exactly as the ternary it replaces did. The client route's rendered DOM is
 * unchanged by wrapping a branch in this (ADM-4 Acceptance 4).
 */

/**
 * What opens a reveal.
 *
 * Four shapes, because four are what the intake actually uses. Three read an
 * answer on the same step; the fourth reads what the client bought, which is
 * not an answer at all — the durable track's booking and Stripe blocks appear
 * because an add-on was purchased, and those questions were invisible to the
 * review before ADM-4 because the preview buys nothing.
 */
export type RevealCondition =
  /** A radio's stored value is exactly this. */
  | { field: string; equals: string }
  /** A radio's stored value is one of these. */
  | { field: string; in: readonly string[] }
  /** A checkbox group's stored list contains this. */
  | { field: string; includes: string }
  /** A purchased add-on, not an answer. */
  | { extra: string };

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
