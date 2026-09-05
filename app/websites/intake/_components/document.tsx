"use client";

import type { ReactNode } from "react";
import type { Choice } from "./choice-group";

/**
 * The small pieces a primitive uses when it renders itself as prose.
 *
 * Extracted rather than repeated in eight files: the tag, the hint, and the
 * option list are the same three shapes everywhere, and eight copies of a
 * `font-mono text-[10px]` string is how a register drifts. The visual law is
 * `docs/admin/ADMIN-UX-SPEC.md` §6.1, which is where these values are decided.
 *
 * **Nothing here holds a question's words.** Every string these render is
 * passed in by the component that already owned it, which is what keeps
 * D-ADM-6 true with a second render mode in the building.
 */

/**
 * The `[Component Type]` tag.
 *
 * Taylor's own notation, kept literally — square brackets in the text rather
 * than a pill, a badge, or a coloured chip. It is an annotation on a document,
 * not a UI element, and it should read as something he typed.
 */
export function DocTag({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <p
      data-md="tag"
      className="font-mono text-[10px] tracking-[.12em] text-(--color-dim)"
    >
      [{children}]
    </p>
  );
}

/**
 * A dim line beneath a tag — a placeholder, a drop label, an after-line.
 *
 * These are real client-facing strings, so they belong in the review; they are
 * simply not the question. Dim keeps them subordinate to the label above.
 */
export function DocHint({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <p
      data-md="hint"
      className="mt-1 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)"
    >
      {children}
    </p>
  );
}

/**
 * The options of a choice group, verbatim and in order.
 *
 * Two annotations ride along because both change what the control *does* and
 * neither is visible from the label alone: the exclusive option (choosing it
 * clears the rest) and a disabled one (real, listed, not yet offered).
 */
export function DocOptions({
  options,
  exclusiveValue,
}: Readonly<{
  options: readonly Choice[];
  exclusiveValue?: string;
}>) {
  return (
    <ul data-md="options" className="mt-2 space-y-1">
      {options.map((option) => (
        <li
          key={option.value}
          className="font-body text-[16px] font-light leading-[1.5] text-(--color-body)"
        >
          {/* On-screen bullet only — a Markdown list draws its own. */}
          <span aria-hidden data-md="skip" className="mr-2 text-(--color-dim)">
            ·
          </span>
          {option.label}
          {option.value === exclusiveValue ? (
            <span className="ml-2 font-mono text-[10px] tracking-[.12em] text-(--color-dim)">
              (clears the others)
            </span>
          ) : null}
          {option.disabled ? (
            <span className="ml-2 font-mono text-[10px] tracking-[.12em] text-(--color-dim)">
              (not offered yet)
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
