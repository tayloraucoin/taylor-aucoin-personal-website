"use client";

import type { ReactNode } from "react";
import { useIsDocument } from "@/components/intake/preview-mode";
import { MachineFilled, useMachineFilled } from "./machine-filled";

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
 *
 * **This file became a client component at ADM-4** so it could read the render
 * mode. Every importer was already `"use client"`, so nothing changed shape;
 * but it can no longer be rendered from a Server Component, and that is now a
 * property of the file rather than an accident of its callers.
 */
export function Field({
  id,
  label,
  labelNode,
  help,
  error,
  note,
  fieldKey,
  value,
  children,
}: {
  id: string;
  label: string;
  /**
   * The label as it renders on screen, when a word inside it carries emphasis.
   *
   * `label` stays the plain string and remains what document mode prints, so
   * the intake markdown can never pick up markup. Callers pass both, and the
   * two must say the same words.
   */
  labelNode?: ReactNode;
  help?: string;
  /**
   * Takes the help line's place when present, following the Conscious
   * Connections `Input` convention (`error ?? helperText`) — one slot under
   * the label, so a correction never pushes the layout around by appearing
   * beside the thing it replaces.
   */
  error?: string;
  note?: ReactNode;
  /**
   * The answer key this question stores under, printed beside it in document
   * mode and shown nowhere else.
   *
   * Passed by `TextAnswer` / `LongAnswer` / `ChoiceAnswer`, which already know
   * it as `name`. Deriving it from `id` instead would mean parsing `f-whatYouDo`
   * back into a key — a heuristic, and a second place the mapping lives.
   * Fields inside a repeatable entry pass none: their key belongs to the entry
   * shape, not to the step's answer document.
   */
  fieldKey?: string;
  /**
   * The field's current value, so a machine-filled mark can show while it is
   * still the machine's (PORT-18). Passed by `TextAnswer` and `LongAnswer`,
   * which already hold it; absent everywhere a `Field` wraps something that is
   * not a step answer — a file drop, a choice group, a repeatable block — and
   * absent means no mark, which is the correct default for all of them.
   */
  value?: unknown;
  children: ReactNode;
}) {
  // Called unconditionally, before the document branch: a hook may not sit
  // behind a return. It resolves to null with no provider, which is every
  // durable route and every preview.
  const machineFilled = useMachineFilled(fieldKey, value);

  if (useIsDocument()) {
    return (
      <FieldDocument label={label} help={help} note={note} fieldKey={fieldKey}>
        {children}
      </FieldDocument>
    );
  }

  return (
    <div className="mb-7">
      <label
        htmlFor={id}
        className="block font-body text-[16px] font-medium leading-[1.4] text-(--color-ink)"
      >
        {labelNode ?? label}
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

      {/* Under the control, not above it: the value is the thing being
          attributed, and a line above the input would read as instruction. */}
      <MachineFilled field={machineFilled} />

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

/**
 * The same question, read rather than answered.
 *
 * A heading instead of a `<label>`, because there is no control to label — an
 * `htmlFor` pointing at nothing is worse than no label at all for a screen
 * reader. The heading is `h3`, which nests under the step's `h2` and keeps the
 * outline navigable (ADMIN-UX-SPEC §6.1).
 *
 * `error` is deliberately not rendered: it is a runtime state of a form nobody
 * is filling. `note` is, because a note is a real line a client can meet.
 */
function FieldDocument({
  label,
  help,
  note,
  fieldKey,
  children,
}: Readonly<{
  label: string;
  help?: string;
  note?: ReactNode;
  fieldKey?: string;
  children: ReactNode;
}>) {
  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between gap-4">
        <h3
          data-md="question"
          className="font-display text-[18px] font-medium leading-[1.3] tracking-[-.012em] text-(--color-ink)"
        >
          {label}
        </h3>
        {fieldKey ? (
          <span
            data-md="key"
            className="shrink-0 font-mono text-[10px] tracking-[.12em] text-(--color-dim)"
          >
            {fieldKey}
          </span>
        ) : null}
      </div>

      {help ? (
        <p
          data-md="help"
          className="mt-1.5 max-w-[68ch] font-body text-[15px] font-light leading-[1.5] text-(--color-dim)"
        >
          {help}
        </p>
      ) : null}

      <div className="mt-2">{children}</div>

      {note ? (
        <p
          data-md="note"
          className="mt-2 font-body text-[13.5px] font-light leading-[1.5] text-(--color-c2)"
        >
          {note}
        </p>
      ) : null}
    </div>
  );
}
