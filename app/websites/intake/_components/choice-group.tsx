"use client";

import { useId } from "react";
import { useIsDocument } from "@/components/intake/preview-mode";
import { DocOptions, DocTag } from "./document";

/**
 * Full-width tap-cards, not native 20px circles — selection has to be
 * readable at arm's length on a phone held at a bad angle, and the target has
 * to survive a thumb.
 *
 * "Not sure" is passed in as an ordinary option and styled identically to its
 * siblings (D-INT-4). A stated unknown is a successful answer: it is what
 * stops a guess becoming a false claim on a live site, which is the failure
 * this whole questionnaire exists to prevent.
 *
 * `exclusiveValue` handles the "nothing" / "none yet" options (UX spec §6.6):
 * choosing it clears the others, choosing anything else clears it. Silent, no
 * error text — the interaction explains itself.
 *
 * Controlled, so the autosave engine owns the value and the same answer cannot
 * exist in two places.
 */
/**
 * `disabled` renders an option that is real but not yet offered — the start
 * form's "coming soon" categories. It stays in the tab order and keeps its full
 * label so a screen-reader user hears the same roadmap a sighted one reads; it
 * simply cannot be chosen. A tooltip would hide that from both.
 */
export type Choice = { value: string; label: string; disabled?: boolean };

/**
 * The tap-card's classes, exported so a richer card can wear the same clothes.
 *
 * Step 9's video shortlist needs an embed above its label, which a `Choice`
 * cannot carry — its label is a string. Exporting the classes is how that card
 * matches this one exactly instead of approximating it with a second set of
 * literals, and it is why the selected border's colour has one home.
 */
export const CARD_CLASS =
  "flex min-h-12 w-full items-center rounded-(--radius) border px-3.5 py-3 text-left font-body text-[16px] font-light leading-[1.4] transition-colors duration-(--dur-fast) ease-(--ease-out)";

export const UNSELECTED_CLASS =
  "border-(--color-faint) bg-(--color-card) text-(--color-body) hover:border-(--color-gold-line-soft) hover:bg-(--color-card-hover)";

export const SELECTED_CLASS =
  "border-(--color-gold-line) bg-(--color-card-hover) text-(--color-ink)";

const DISABLED_CLASS =
  "border-(--color-faint) bg-(--color-card) text-(--color-dim) opacity-60";

export function ChoiceGroup({
  legend,
  name,
  options,
  value,
  onChange,
  onBlur,
  multiple = false,
  exclusiveValue,
  locked,
}: {
  legend: string;
  name: string;
  options: readonly Choice[];
  value: readonly string[];
  onChange: (next: string[]) => void;
  onBlur?: () => void;
  multiple?: boolean;
  exclusiveValue?: string;
  /**
   * Values that are always on and cannot be turned off.
   *
   * Different from `disabled`, which means "not available": a locked option is
   * chosen, it reads as chosen, and the tick is simply not a decision anyone
   * has to make. Home is the case it exists for — every site has one, so
   * offering it as a choice invites a client to uncheck it and produce a
   * sitemap nobody meant (Taylor, 2026-09-04).
   *
   * The caller is responsible for the value actually being stored; this only
   * governs how it renders and refuses to toggle.
   */
  locked?: readonly string[];
}) {
  const groupId = useId();
  const document = useIsDocument();

  function toggle(option: string) {
    if (options.find((o) => o.value === option)?.disabled) return;
    if (locked?.includes(option)) return;

    if (!multiple) {
      onChange([option]);
      return;
    }

    if (option === exclusiveValue) {
      onChange(value.includes(option) ? [] : [option]);
      return;
    }

    const withoutExclusive = value.filter((v) => v !== exclusiveValue);

    onChange(
      withoutExclusive.includes(option)
        ? withoutExclusive.filter((v) => v !== option)
        : [...withoutExclusive, option],
    );
  }

  /**
   * Whether the answer is one value or a list is the single most consequential
   * thing about a choice question and the least visible on a page, so the tag
   * says it outright. The options follow verbatim: a review of the questions is
   * mostly a review of the answers on offer.
   */
  if (document) {
    return (
      <>
        <DocTag>{multiple ? "Multiple choice" : "Single choice"}</DocTag>
        <DocOptions options={options} exclusiveValue={exclusiveValue} />
      </>
    );
  }

  return (
    <fieldset className="min-w-0 border-0 p-0" onBlur={onBlur}>
      <legend className="sr-only">{legend}</legend>

      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const isLocked = locked?.includes(option.value) ?? false;
          const isSelected = value.includes(option.value) || isLocked;
          const id = `${groupId}-${option.value}`;

          // A locked option reads as what it is — chosen — rather than as
          // unavailable. `DISABLED_CLASS` would dim the one page every site has.
          const state = option.disabled
            ? DISABLED_CLASS
            : isSelected
              ? SELECTED_CLASS
              : UNSELECTED_CLASS;

          return (
            <label
              key={option.value}
              htmlFor={id}
              className={`${CARD_CLASS} ${state} ${
                option.disabled || isLocked
                  ? "cursor-default"
                  : "cursor-pointer"
              }`}
            >
              <input
                id={id}
                type={multiple ? "checkbox" : "radio"}
                name={name}
                value={option.value}
                checked={isSelected}
                // Focusable and announced, but never selectable: `aria-disabled`
                // rather than `disabled`, which would drop it from the tab order
                // and hide the roadmap from exactly the users who cannot see the
                // dimmed styling.
                aria-disabled={option.disabled || isLocked || undefined}
                onChange={() => toggle(option.value)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={`mr-3 h-2 w-2 shrink-0 rounded-full transition-colors duration-(--dur-fast) ${
                  isSelected ? "bg-(--color-c2)" : "bg-(--color-faint)"
                }`}
              />
              <span className="grow">{option.label}</span>

              {/* Says why it cannot be unticked, rather than leaving a control
                  that silently ignores the click. */}
              {isLocked ? (
                <span className="ml-3 shrink-0 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
                  Always
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
