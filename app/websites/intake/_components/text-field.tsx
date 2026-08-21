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
  "w-full rounded-(--radius) border bg-(--color-card) px-3.5 font-body text-[16px] font-light text-(--color-ink) transition-colors duration-(--dur-fast) ease-(--ease-out) placeholder:text-(--color-dim) disabled:cursor-not-allowed disabled:opacity-60";

const BORDER_DEFAULT =
  "border-(--color-faint) hover:border-[rgb(232_185_97/.28)] focus:border-[rgb(232_185_97/.55)]";

/**
 * An invalid field warms toward gold rather than turning red. The palette has
 * no red, and a form whose whole promise is "nothing you write here is wrong"
 * should not shout at someone for a typo in their own email address.
 */
const BORDER_INVALID = "border-[rgb(232_185_97/.7)]";

/**
 * Per-mode input attributes, following the Conscious Connections `Input`
 * primitive (`packages/ui/src/primitives/control/input/input.tsx`).
 *
 * These matter most on a phone: the right `inputMode` is the difference
 * between a keyboard with an @ key and one without, and `autoCapitalize` off
 * stops iOS turning an email address into "Sam@Example.com".
 */
export type FieldMode = "text" | "email" | "tel" | "url";

function modeAttributes(mode: FieldMode): Partial<ComponentProps<"input">> {
  switch (mode) {
    case "email":
      return {
        type: "email",
        inputMode: "email",
        autoComplete: "email",
        autoCapitalize: "none",
        autoCorrect: "off",
        spellCheck: false,
      };
    case "tel":
      return { type: "tel", inputMode: "tel", autoComplete: "tel" };
    case "url":
      return {
        type: "text",
        inputMode: "url",
        autoCapitalize: "none",
        autoCorrect: "off",
        spellCheck: false,
      };
    default:
      return { type: "text" };
  }
}

/**
 * Everything a phone number is allowed to contain.
 *
 * Digits plus the punctuation people actually type — `604-353-4287`,
 * `+1 (604) 353-4287`, `604.353.4287` all survive. Letters are dropped as they
 * are typed rather than rejected afterwards, because a field that silently
 * refuses a keystroke teaches the rule instantly and a field that complains at
 * the end does not.
 *
 * No auto-formatting. Reformatting someone's own phone number while they type
 * it is the kind of helpfulness that fights muscle memory.
 */
function stripToPhone(value: string): string {
  return value.replace(/[^\d\s+().-]/g, "");
}

export function TextField({
  id,
  helpId,
  mode = "text",
  invalid,
  onValueChange,
  ...rest
}: {
  id: string;
  helpId?: string;
  mode?: FieldMode;
  invalid?: boolean;
  onValueChange?: (value: string) => void;
} & Omit<ComponentProps<"input">, "id" | "className" | "type">) {
  return (
    <input
      {...modeAttributes(mode)}
      {...rest}
      id={id}
      aria-describedby={helpId}
      aria-invalid={invalid || undefined}
      onChange={(event) => {
        if (mode === "tel") {
          const cleaned = stripToPhone(event.target.value);
          if (cleaned !== event.target.value) event.target.value = cleaned;
        }
        rest.onChange?.(event);
        onValueChange?.(event.target.value);
      }}
      className={`${CONTROL_CLASS} ${invalid ? BORDER_INVALID : BORDER_DEFAULT} h-12`}
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
      className={`${CONTROL_CLASS} ${BORDER_DEFAULT} min-h-[104px] resize-y py-3 leading-[1.6]`}
    />
  );
}

/** A pragmatic client-side check. The server's Zod schema remains the truth. */
export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}
