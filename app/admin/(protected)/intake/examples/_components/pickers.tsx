"use client";

import type { ReactNode } from "react";

/**
 * The controls a hundred and ten sites are tagged with.
 *
 * At 110 sites × 3 axes, the difference between a segmented control and a
 * `<select>` is 330 menu interactions. One click, no menu, everything visible —
 * which also means the whole vocabulary is legible while the judgement is being
 * made, rather than hidden behind a disclosure.
 *
 * **A selected cell is not gold.** Seven selected cells per editor would make
 * gold a wash, and on this surface gold says exactly one thing: a client can
 * see this. Selection is ink on the tint, which is the admin's own settings
 * grammar (D-ADM-13's theme control uses it for the same reason).
 */
export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-(family-name:--font-mono) text-[10px] tracking-[.28em] text-(--color-dim) uppercase">
      {children}
    </span>
  );
}

const CELL =
  "min-h-[44px] rounded-(--radius) border px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)";

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  note,
}: {
  label: string;
  value: T | null;
  options: readonly { value: T; label: string }[];
  onChange: (next: T) => void;
  note?: ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2">
        <FieldLabel>{label}</FieldLabel>
      </legend>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              className={`${CELL} ${
                selected
                  ? "border-(--color-line-strong) bg-(--color-tint) text-(--color-ink)"
                  : "border-(--color-line) text-(--color-body) hover:bg-(--color-card-hover)"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {note ? (
        <p className="max-w-[48ch] text-sm text-(--color-dim)">{note}</p>
      ) : null}
    </fieldset>
  );
}

/**
 * A bounded multi-select that stops accepting at its ceiling.
 *
 * **The ceiling is visible before you meet it, not announced as a rejection
 * after a click.** At three selected, the unselected chips go `aria-disabled`
 * and the helper line says why — so a fourth tag is never something you tried
 * and were refused, and a four-tag row can never reach the publish gate.
 */
export function ChipSet<T extends string>({
  label,
  values,
  options,
  onChange,
  max,
  note,
}: {
  label: string;
  values: readonly T[];
  options: readonly { value: T; label: string }[];
  onChange: (next: T[]) => void;
  max?: number;
  note?: ReactNode;
}) {
  const atCeiling = max !== undefined && values.length >= max;

  function toggle(value: T) {
    if (values.includes(value)) {
      onChange(values.filter((held) => held !== value));
      return;
    }
    if (atCeiling) return;
    onChange([...values, value]);
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2">
        <FieldLabel>{label}</FieldLabel>
      </legend>

      {note ? (
        <p className="max-w-[48ch] text-sm text-(--color-dim)">{note}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = values.includes(option.value);
          const blocked = atCeiling && !selected;

          return (
            <button
              key={option.value}
              type="button"
              role="checkbox"
              aria-checked={selected}
              aria-disabled={blocked}
              onClick={() => toggle(option.value)}
              className={`${CELL} ${
                selected
                  ? "border-(--color-line-strong) bg-(--color-tint) text-(--color-ink)"
                  : blocked
                    ? "border-(--color-line-soft) text-(--color-dim)"
                    : "border-(--color-line) text-(--color-body) hover:bg-(--color-card-hover)"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Announced, not only shown: the ceiling arriving is a state change. */}
      <p aria-live="polite" className="text-sm text-(--color-dim)">
        {atCeiling ? "Three selected. Deselect one to change it." : ""}
      </p>
    </fieldset>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  note,
  mono,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  note?: ReactNode;
  mono?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <FieldLabel>{label}</FieldLabel>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`min-h-[44px] w-full rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-c2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2) ${
          mono ? "font-(family-name:--font-mono) text-xs" : ""
        }`}
      />
      {note ? (
        <span className="max-w-[48ch] text-sm text-(--color-dim)">{note}</span>
      ) : null}
    </label>
  );
}
