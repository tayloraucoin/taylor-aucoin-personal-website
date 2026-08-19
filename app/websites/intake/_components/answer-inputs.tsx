"use client";

import type { ReactNode } from "react";
import type { useStepAutosave } from "../_lib/use-step-autosave";
import { ChoiceGroup, type Choice } from "./choice-group";
import { Field } from "./field";
import { TextArea, TextField, type FieldMode } from "./text-field";

export type StepAutosave = ReturnType<typeof useStepAutosave>;

/**
 * The three shapes every question on this form takes, wired to autosave.
 *
 * Written once here so a step file reads as its question list rather than as
 * fifty near-identical bindings — and so the save-on-blur rule cannot be
 * forgotten on one field out of fifty. INT-6's steps use the same three.
 */

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asList(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

export function TextAnswer({
  form,
  name,
  label,
  help,
  note,
  placeholder,
  mode,
}: {
  form: StepAutosave;
  name: string;
  label: string;
  help?: string;
  note?: string;
  placeholder?: string;
  mode?: FieldMode;
}) {
  const id = `f-${name}`;

  return (
    <Field id={id} label={label} help={help} note={note}>
      <TextField
        id={id}
        helpId={help ? `${id}-help` : undefined}
        value={asText(form.values[name])}
        onChange={(event) => form.setValue(name, event.target.value)}
        onBlur={form.flush}
        placeholder={placeholder}
        mode={mode}
      />
    </Field>
  );
}

export function LongAnswer({
  form,
  name,
  label,
  help,
  placeholder,
}: {
  form: StepAutosave;
  name: string;
  label: string;
  help?: string;
  placeholder?: string;
}) {
  const id = `f-${name}`;

  return (
    <Field id={id} label={label} help={help}>
      <TextArea
        id={id}
        helpId={help ? `${id}-help` : undefined}
        value={asText(form.values[name])}
        onChange={(event) => form.setValue(name, event.target.value)}
        onBlur={form.flush}
        placeholder={placeholder}
      />
    </Field>
  );
}

/**
 * The seam between `ChoiceGroup`, which speaks in arrays because a checkbox
 * group genuinely is a list, and the stored answer, which for a radio is a
 * single string.
 *
 * This conversion has to live here rather than in either neighbour. Without
 * it, a radio stored `["yes"]`, which is not what `stepBusinessSchema.insured`
 * (a string) accepts — so the shape guard dropped the field on every save and
 * every `values.x === "yes"` conditional stayed shut. Silent in the browser,
 * silent in the database: the answer simply was never there.
 */
export function ChoiceAnswer({
  form,
  name,
  label,
  help,
  note,
  options,
  multiple,
  exclusiveValue,
}: {
  form: StepAutosave;
  name: string;
  label: string;
  help?: string;
  note?: ReactNode;
  options: readonly Choice[];
  multiple?: boolean;
  exclusiveValue?: string;
}) {
  const id = `f-${name}`;
  const stored = form.values[name];

  const value = multiple
    ? asList(stored)
    : typeof stored === "string" && stored
      ? [stored]
      : [];

  return (
    <Field id={id} label={label} help={help} note={note}>
      <ChoiceGroup
        legend={label}
        name={name}
        options={options}
        value={value}
        onChange={(next) =>
          form.setValue(name, multiple ? next : (next[0] ?? ""))
        }
        onBlur={form.flush}
        multiple={multiple}
        exclusiveValue={exclusiveValue}
      />
    </Field>
  );
}
