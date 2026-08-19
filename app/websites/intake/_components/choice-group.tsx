"use client";

import { useId } from "react";

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
export type Choice = { value: string; label: string };

const CARD_CLASS =
  "flex min-h-12 w-full items-center rounded-(--radius) border px-3.5 py-3 text-left font-body text-[16px] font-light leading-[1.4] transition-colors duration-(--dur-fast) ease-(--ease-out)";

const UNSELECTED_CLASS =
  "border-(--color-faint) bg-(--color-card) text-(--color-body) hover:border-[rgb(232_185_97/.28)] hover:bg-(--color-card-hover)";

const SELECTED_CLASS =
  "border-[rgb(232_185_97/.55)] bg-(--color-card-hover) text-(--color-ink)";

export function ChoiceGroup({
  legend,
  name,
  options,
  value,
  onChange,
  onBlur,
  multiple = false,
  exclusiveValue,
}: {
  legend: string;
  name: string;
  options: readonly Choice[];
  value: readonly string[];
  onChange: (next: string[]) => void;
  onBlur?: () => void;
  multiple?: boolean;
  exclusiveValue?: string;
}) {
  const groupId = useId();

  function toggle(option: string) {
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

  return (
    <fieldset className="min-w-0 border-0 p-0" onBlur={onBlur}>
      <legend className="sr-only">{legend}</legend>

      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const isSelected = value.includes(option.value);
          const id = `${groupId}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={id}
              className={`${CARD_CLASS} ${isSelected ? SELECTED_CLASS : UNSELECTED_CLASS} cursor-pointer`}
            >
              <input
                id={id}
                type={multiple ? "checkbox" : "radio"}
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => toggle(option.value)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={`mr-3 h-2 w-2 shrink-0 rounded-full transition-colors duration-(--dur-fast) ${
                  isSelected ? "bg-(--color-c2)" : "bg-(--color-faint)"
                }`}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
