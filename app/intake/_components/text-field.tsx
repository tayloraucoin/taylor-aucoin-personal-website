"use client";

import type { ComponentProps } from "react";

/**
 * The 16px minimum is not a type-scale preference — it is the threshold below
 * which iOS Safari zooms the viewport on focus. A form filled in a van cannot
 * afford a layout that jumps every time a thumb lands in a field.
 *
 * Height is 48px, above the 44px floor: the hands using this are often thick,
 * gloved, or cold.
 *
 * Focus is the site's gold ring, inherited from the global `:focus-visible`
 * rule, plus a border warm-up so a touch user (who gets no ring) still sees
 * which field is live.
 */
const CONTROL_CLASS =
  "w-full rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-3.5 font-body text-[16px] font-light text-(--color-ink) transition-colors duration-(--dur-fast) ease-(--ease-out) placeholder:text-(--color-dim) hover:border-[rgb(232_185_97/.28)] focus:border-[rgb(232_185_97/.55)] disabled:cursor-not-allowed disabled:opacity-60";

export function TextField({
  id,
  helpId,
  ...rest
}: { id: string; helpId?: string } & Omit<
  ComponentProps<"input">,
  "id" | "className"
>) {
  return (
    <input
      {...rest}
      id={id}
      aria-describedby={helpId}
      className={`${CONTROL_CLASS} h-12`}
    />
  );
}

/**
 * Three rows minimum. A one-row box invites a one-line answer, and the
 * open-text questions on this form are the ones where a real paragraph is
 * worth the most (build spec §2.7).
 */
export function TextArea({
  id,
  helpId,
  ...rest
}: { id: string; helpId?: string } & Omit<
  ComponentProps<"textarea">,
  "id" | "className"
>) {
  return (
    <textarea
      {...rest}
      id={id}
      rows={rest.rows ?? 3}
      aria-describedby={helpId}
      className={`${CONTROL_CLASS} min-h-[104px] resize-y py-3 leading-[1.6]`}
    />
  );
}
