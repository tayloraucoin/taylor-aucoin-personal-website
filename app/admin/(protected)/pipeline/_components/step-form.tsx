"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Markup } from "@/app/admin/_components/markup";
import { RECORD_NAMES } from "@/lib/pipeline/template";
import { adminRoutes } from "@/lib/routes";
import {
  createStepAction,
  deleteStepAction,
  setStepArchivedAction,
  updateStepAction,
  type StepField,
} from "../_actions/steps";

/**
 * One step's editor (PIPE-2), on its own page because a prompt is long-form
 * writing and a dialog is the wrong container for minutes of it.
 *
 * Edits are backed up to sessionStorage as they are typed, keyed by step, and
 * cleared only by a successful save — a failed save, a refresh, or an error
 * overlay must not eat a prompt that was already written. The pattern is the
 * intro email's.
 */

export type StepFormValues = {
  title: string;
  prompt: string;
  emailSubject: string;
  emailBody: string;
};

type StepFormProps =
  | { mode: "new" }
  | {
      mode: "edit";
      id: string;
      initial: StepFormValues;
      archived: boolean;
      used: boolean;
    };

const EMPTY: StepFormValues = {
  title: "",
  prompt: "",
  emailSubject: "",
  emailBody: "",
};

function draftKey(id: string | null) {
  return `pipeline-step-draft:${id ?? "new"}`;
}

function readDraft(id: string | null): StepFormValues | null {
  try {
    const raw = sessionStorage.getItem(draftKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StepFormValues>;
    return {
      title: typeof parsed.title === "string" ? parsed.title : "",
      prompt: typeof parsed.prompt === "string" ? parsed.prompt : "",
      emailSubject: typeof parsed.emailSubject === "string" ? parsed.emailSubject : "",
      emailBody: typeof parsed.emailBody === "string" ? parsed.emailBody : "",
    };
  } catch {
    return null;
  }
}

function writeDraft(id: string | null, values: StepFormValues) {
  try {
    sessionStorage.setItem(draftKey(id), JSON.stringify(values));
  } catch {
    // Storage full or blocked — the in-memory draft is still the live one.
  }
}

function clearDraft(id: string | null) {
  try {
    sessionStorage.removeItem(draftKey(id));
  } catch {
    // Losing the backup is not worth throwing from a save.
  }
}

function same(a: StepFormValues, b: StepFormValues) {
  return (
    a.title === b.title &&
    a.prompt === b.prompt &&
    a.emailSubject === b.emailSubject &&
    a.emailBody === b.emailBody
  );
}

const field =
  "min-h-[44px] rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 text-base text-(--color-ink) outline-none focus-visible:border-(--color-c2) aria-invalid:border-(--color-c2)";
const area =
  "rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 py-2 font-(family-name:--font-mono) text-xs leading-relaxed text-(--color-ink) outline-none focus-visible:border-(--color-c2) aria-invalid:border-(--color-c2)";

export function StepForm(props: StepFormProps) {
  const router = useRouter();
  const id = props.mode === "edit" ? props.id : null;
  const saved = props.mode === "edit" ? props.initial : EMPTY;

  const [values, setValues] = useState<StepFormValues>(saved);
  const [restored, setRestored] = useState(false);
  const [preview, setPreview] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<{ message: string; field?: StepField } | null>(null);
  const [pending, startTransition] = useTransition();

  // A draft that differs from what is saved was left by a failed save or a
  // refresh; bring it back and say so. Runs once, after hydration, because
  // sessionStorage does not exist on the server.
  useEffect(() => {
    const draft = readDraft(id);
    if (draft && !same(draft, saved)) {
      setValues(draft);
      setRestored(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on mount
  }, []);

  function update<K extends keyof StepFormValues>(key: K, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    writeDraft(id, next);
    setStatus("");
    if (error?.field === key) setError(null);
  }

  function discardDraft() {
    clearDraft(id);
    setValues(saved);
    setRestored(false);
  }

  function save() {
    setError(null);
    setStatus("Saving…");
    startTransition(async () => {
      const input = {
        title: values.title,
        prompt: values.prompt,
        emailSubject: values.emailSubject,
        emailBody: values.emailBody,
      };

      if (id === null) {
        const result = await createStepAction(input);
        if (!result.ok) {
          setStatus("");
          setError(result);
          return;
        }
        clearDraft(null);
        router.push(adminRoutes.pipeline);
        return;
      }

      const result = await updateStepAction(id, input);
      if (!result.ok) {
        setStatus("");
        setError(result);
        return;
      }
      clearDraft(id);
      setRestored(false);
      setStatus("Saved.");
      router.refresh();
    });
  }

  function setArchived(archived: boolean) {
    if (id === null) return;
    setError(null);
    startTransition(async () => {
      const result = await setStepArchivedAction(id, archived);
      if (!result.ok) {
        setError(result);
        return;
      }
      setStatus(archived ? "Archived." : "Unarchived. It's at the end of the list.");
      router.refresh();
    });
  }

  function remove() {
    if (id === null) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteStepAction(id);
      if (!result.ok) {
        setConfirmingDelete(false);
        setError(result);
        return;
      }
      clearDraft(id);
      router.push(adminRoutes.pipeline);
    });
  }

  const fieldError = (name: StepField) =>
    error?.field === name ? error.message : null;

  return (
    <div className="flex flex-col gap-6">
      {props.mode === "edit" && props.archived ? (
        <div className="flex flex-wrap items-center gap-3 rounded-(--radius) border border-(--color-line-soft) bg-(--color-tint) px-4 py-3">
          <p className="text-sm text-(--color-body)">
            Archived — not offered on engagements.
          </p>
          <button
            type="button"
            onClick={() => setArchived(false)}
            disabled={pending}
            className="ml-auto min-h-[44px] px-2 text-sm text-(--color-ink) underline disabled:opacity-60"
          >
            Unarchive
          </button>
        </div>
      ) : null}

      {restored ? (
        <p className="flex flex-wrap items-center gap-3 text-sm text-(--color-c2)">
          Your unsaved edits are back.
          <button
            type="button"
            onClick={discardDraft}
            className="min-h-[44px] text-sm text-(--color-dim) underline"
          >
            Discard them
          </button>
        </p>
      ) : null}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-(--color-body)">Title</span>
        <input
          type="text"
          value={values.title}
          onChange={(event) => update("title", event.target.value)}
          maxLength={200}
          aria-invalid={fieldError("title") ? true : undefined}
          aria-describedby={fieldError("title") ? "step-title-error" : undefined}
          className={field}
        />
        {fieldError("title") ? (
          <span id="step-title-error" className="text-sm text-(--color-c2)">
            {fieldError("title")}
          </span>
        ) : null}
      </label>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-end justify-between gap-3">
          <label htmlFor="step-prompt" className="text-sm text-(--color-body)">
            Prompt
          </label>
          <button
            type="button"
            onClick={() => setPreview((shown) => !shown)}
            aria-pressed={preview}
            aria-controls="step-prompt-preview"
            className="min-h-[44px] px-2 text-sm text-(--color-dim) underline"
          >
            {preview ? "Hide preview" : "Preview"}
          </button>
        </div>
        <textarea
          id="step-prompt"
          value={values.prompt}
          onChange={(event) => update("prompt", event.target.value)}
          rows={18}
          spellCheck={false}
          className={area}
        />
        {preview ? (
          <div
            id="step-prompt-preview"
            className="rounded-(--radius) border border-(--color-line-soft) px-4 py-3 text-sm text-(--color-body)"
          >
            {values.prompt.trim() ? (
              <Markup source={values.prompt} />
            ) : (
              <p className="text-(--color-dim)">Nothing to preview.</p>
            )}
          </div>
        ) : null}
        <span className="text-xs text-(--color-dim)">
          Markdown. Leave it empty for an email-only step.
        </span>
      </div>

      <fieldset className="flex flex-col gap-4 border-t border-(--color-line-soft) pt-6">
        <legend className="text-sm text-(--color-ink)">Client email</legend>
        <p className="max-w-[60ch] text-xs text-(--color-dim)">
          Optional. Write <code className="font-(family-name:--font-mono)">{"{{name}}"}</code>{" "}
          where a value goes. These fill themselves from the engagement:{" "}
          {RECORD_NAMES.join(", ")}. Any other name is asked for when you send.
          Prompts can use them too.
        </p>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-(--color-body)">Subject</span>
          <input
            type="text"
            value={values.emailSubject}
            onChange={(event) => update("emailSubject", event.target.value)}
            maxLength={300}
            aria-invalid={fieldError("emailSubject") ? true : undefined}
            aria-describedby={fieldError("emailSubject") ? "step-subject-error" : undefined}
            className={field}
          />
          {fieldError("emailSubject") ? (
            <span id="step-subject-error" className="text-sm text-(--color-c2)">
              {fieldError("emailSubject")}
            </span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-(--color-body)">Body</span>
          <textarea
            value={values.emailBody}
            onChange={(event) => update("emailBody", event.target.value)}
            rows={14}
            aria-invalid={fieldError("emailBody") ? true : undefined}
            aria-describedby={fieldError("emailBody") ? "step-body-error" : undefined}
            className={area}
          />
          {fieldError("emailBody") ? (
            <span id="step-body-error" className="text-sm text-(--color-c2)">
              {fieldError("emailBody")}
            </span>
          ) : null}
        </label>
      </fieldset>

      {error && !error.field ? (
        <p role="alert" className="text-sm text-(--color-c2)">
          {error.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-(--color-line-soft) pt-6">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="min-h-[44px] rounded-(--radius) bg-(--color-action) px-4 text-sm font-medium text-white disabled:opacity-60"
        >
          {props.mode === "new" ? "Add step" : "Save"}
        </button>

        <span role="status" className="text-sm text-(--color-dim)">
          {status}
        </span>

        {props.mode === "edit" ? (
          <span className="ml-auto flex flex-wrap items-center gap-3">
            {!props.archived ? (
              <button
                type="button"
                onClick={() => setArchived(true)}
                disabled={pending}
                className="min-h-[44px] px-2 text-sm text-(--color-dim) underline disabled:opacity-60"
              >
                Archive
              </button>
            ) : null}

            {!props.used ? (
              confirmingDelete ? (
                <span className="flex flex-wrap items-center gap-3 text-sm text-(--color-body)">
                  Delete &ldquo;{props.initial.title}&rdquo;? This can&rsquo;t be undone.
                  <button
                    type="button"
                    onClick={remove}
                    disabled={pending}
                    className="min-h-[44px] px-2 text-sm text-(--color-c2) underline disabled:opacity-60"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    className="min-h-[44px] px-2 text-sm text-(--color-dim) underline"
                  >
                    Keep it
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  disabled={pending}
                  className="min-h-[44px] px-2 text-sm text-(--color-dim) underline disabled:opacity-60"
                >
                  Delete
                </button>
              )
            ) : null}
          </span>
        ) : null}
      </div>
    </div>
  );
}
