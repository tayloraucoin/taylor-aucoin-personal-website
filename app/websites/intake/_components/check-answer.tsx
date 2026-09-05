"use client";

import type { ReactNode } from "react";
import { useIsDocument } from "@/components/intake/preview-mode";
import { DocTag } from "./document";
import { Field } from "./field";
import type { StepAutosave } from "./answer-inputs";

/**
 * A single checkbox whose meaning is a sentence, not a word.
 *
 * The same markup existed six times across the two tracks — permission to
 * publish kind words, keep-my-wording, consent to record, and "feature this" on
 * an experience entry. Six copies of one control is six places a focus ring or
 * a tap target can drift, and none of them had a document rendering.
 *
 * **The sentence is the label and the box is not decoration.** Every one of
 * these is a consent or a permission: what the client is agreeing to has to be
 * readable in full beside the control, never summarised into a word. Unchecked
 * by default, always — a pre-ticked consent is not consent.
 *
 * The `setValue`-then-`flush` pairing on toggle is preserved exactly as each
 * hand-rolled copy had it: a checkbox has no blur to save on, so it saves
 * immediately.
 */

const ROW_CLASS =
  "flex min-h-12 cursor-pointer gap-3 rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-3.5 py-3 font-body text-[16px] font-light leading-[1.4] text-(--color-body)";

const BOX_CLASS = "h-5 w-5 shrink-0 accent-(--color-c2)";

/**
 * The control itself, controlled by its caller.
 *
 * Used directly where the value is not a step answer — "Feature this" belongs
 * to one entry inside a repeatable block, not to the step's answer document.
 */
export function CheckRow({
  checked,
  onChange,
  align = "start",
  bare = false,
  children,
}: Readonly<{
  checked: boolean;
  onChange: (next: boolean) => void;
  /** `start` when the sentence wraps to two lines, `center` when it will not. */
  align?: "start" | "center";
  /** No card around it — for a row already inside an entry card. */
  bare?: boolean;
  children: ReactNode;
}>) {
  if (useIsDocument()) {
    return (
      <>
        <DocTag>Checkbox</DocTag>
        <p
          data-md="help"
          className="mt-1 max-w-[68ch] font-body text-[15px] font-light leading-[1.5] text-(--color-body)"
        >
          {children}
        </p>
      </>
    );
  }

  return (
    <label
      className={
        bare
          ? "flex min-h-12 cursor-pointer items-center gap-3 font-body text-[16px] font-light text-(--color-body)"
          : `${ROW_CLASS} ${align === "start" ? "items-start" : "items-center"}`
      }
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className={`${BOX_CLASS}${align === "start" && !bare ? " mt-0.5" : ""}`}
      />
      {children}
    </label>
  );
}

/**
 * The same control, bound to a step answer and wrapped in its question.
 *
 * `Field` supplies the label and the help line, so a checkbox reads as a
 * question with an answer rather than as an option floating in a form.
 */
export function CheckAnswer({
  form,
  name,
  label,
  help,
  align = "start",
  children,
}: Readonly<{
  form: StepAutosave;
  name: string;
  label: string;
  help?: string;
  align?: "start" | "center";
  children: ReactNode;
}>) {
  return (
    <Field id={`f-${name}`} label={label} help={help} fieldKey={name}>
      <CheckRow
        checked={form.values[name] === true}
        align={align}
        onChange={(next) => {
          form.setValue(name, next);
          // No blur on a checkbox, so the save is immediate.
          form.flush();
        }}
      >
        {children}
      </CheckRow>
    </Field>
  );
}
