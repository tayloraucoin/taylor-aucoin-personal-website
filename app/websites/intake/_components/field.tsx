import type { ReactNode } from "react";

/**
 * Label, optional why-line, control, optional note.
 *
 * Two rules are structural, not stylistic:
 *
 * The label is a real `<label>` bound by id. Placeholder-as-label is banned
 * across this surface — it disappears exactly when a distracted person needs
 * it most.
 *
 * There is no required marker anywhere, because nothing is required (D-INT-4).
 * A field the client skips is a question for the call, not an error.
 *
 * `help` is the one-line "why we're asking" from the build spec §2.8 — under
 * the label, never a paragraph.
 *
 * `note` is the slot for gold informational lines (the three-name mismatch on
 * step 1, for instance). Gold, never red: the palette has no red, and nothing
 * a client types here is wrong.
 */
export function Field({
  id,
  label,
  help,
  error,
  note,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  /**
   * Takes the help line's place when present, following the Conscious
   * Connections `Input` convention (`error ?? helperText`) — one slot under
   * the label, so a correction never pushes the layout around by appearing
   * beside the thing it replaces.
   */
  error?: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mb-7">
      <label
        htmlFor={id}
        className="block font-body text-[16px] font-medium leading-[1.4] text-(--color-ink)"
      >
        {label}
      </label>

      {error ? (
        <p
          id={`${id}-help`}
          role="alert"
          className="mt-1.5 font-body text-[13.5px] font-light leading-[1.5] text-(--color-c2)"
        >
          {error}
        </p>
      ) : help ? (
        <p
          id={`${id}-help`}
          className="mt-1.5 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)"
        >
          {help}
        </p>
      ) : null}

      <div className="mt-3">{children}</div>

      {note ? (
        <p
          aria-live="polite"
          className="mt-2 font-body text-[13.5px] font-light leading-[1.5] text-(--color-c2)"
        >
          {note}
        </p>
      ) : null}
    </div>
  );
}
