"use client";

import type { useStepAutosave } from "../_lib/use-step-autosave";
import { ChoiceGroup, type Choice } from "./choice-group";
import { Field } from "./field";
import { TextArea, TextField } from "./text-field";

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
  inputMode,
}: {
  form: StepAutosave;
  name: string;
  label: string;
  help?: string;
  note?: string;
  placeholder?: string;
  inputMode?: "email" | "tel" | "text";
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
        inputMode={inputMode}
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

export function ChoiceAnswer({
  form,
  name,
  label,
  help,
  options,
  multiple,
  exclusiveValue,
}: {
  form: StepAutosave;
  name: string;
  label: string;
  help?: string;
  options: readonly Choice[];
  multiple?: boolean;
  exclusiveValue?: string;
}) {
  const id = `f-${name}`;

  return (
    <Field id={id} label={label} help={help}>
      <ChoiceGroup
        legend={label}
        name={name}
        options={options}
        value={asList(form.values[name])}
        onChange={(next) => form.setValue(name, next)}
        onBlur={form.flush}
        multiple={multiple}
        exclusiveValue={exclusiveValue}
      />
    </Field>
  );
}
