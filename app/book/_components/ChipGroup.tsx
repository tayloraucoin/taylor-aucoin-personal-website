import type { ReactNode } from "react";
import { ErrorLine } from "@/components/forms/ErrorLine";

/**
 * A screening field (PP-2): a Small 15 legend over single-choice chips
 * that wrap at 8px. Native radios, so Tab enters the group and arrow keys
 * move and select. A chip is 36px with the strong border; selected, it
 * takes the surface fill, a text-colour border, text colour and a 3px mark
 * bar along its base, at unchanged width, no check (D-SITE-168, 170, 177).
 * The focus ring wraps the whole chip, so it never reads as the bar.
 */
export function ChipGroup<K extends string>({
  id,
  name,
  label,
  options,
  value,
  onChange,
  error,
}: {
  id: string;
  name: string;
  label: string;
  options: Record<K, string>;
  value: K | "";
  onChange: (value: K) => void;
  error?: ReactNode;
}) {
  const legendId = `${id}-legend`;
  const errorId = `${id}-error`;
  return (
    <fieldset
      role="radiogroup"
      aria-labelledby={legendId}
      aria-required="true"
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
    >
      <legend
        id={legendId}
        className="mb-2.5 text-small font-medium text-(--color-ink)"
      >
        {label}
      </legend>
      {error ? (
        <ErrorLine id={errorId} className="mb-2.5">
          {error}
        </ErrorLine>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(options) as [K, string][]).map(([key, text]) => (
          <label key={key} className="relative inline-flex cursor-pointer">
            <input
              type="radio"
              name={name}
              value={key}
              checked={value === key}
              onChange={() => onChange(key)}
              className="peer sr-only"
            />
            <span className="inline-flex h-9 items-center rounded-(--radius) border border-(--color-line-strong) px-[14px] text-small font-medium text-(--color-body) transition-colors duration-(--dur-fast) peer-checked:border-(--color-ink) peer-checked:bg-(--color-section) peer-checked:text-(--color-ink) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--color-focus) hover:border-(--color-ink)">
              {text}
            </span>
            <span
              aria-hidden
              data-chip-bar
              className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[3px] rounded-b-(--radius) bg-(--color-mark) peer-checked:block"
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
