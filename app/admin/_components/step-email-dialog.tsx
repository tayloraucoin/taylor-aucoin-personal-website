"use client";

import { useEffect, useState, useTransition } from "react";
import { sendStepEmailAction } from "@/app/admin/(protected)/engagements/_actions/pipeline";
import {
  findLeftoverPlaceholders,
  findTemplateNames,
  renderPipelineTemplate,
} from "@/lib/pipeline/template";

/**
 * A pipeline step's email, written and sent from the engagement (PIPE-4).
 *
 * The dialog holds the template and the values, and renders the letter from
 * them. Each `{{name}}` in the template is a field above the letter, filled
 * from the record and from what Taylor typed for this client before. Typing
 * in a field fills the letter live.
 *
 * The moment Taylor edits the subject or the body by hand, that text becomes
 * literal and his words win: later field changes fill only the placeholders
 * still left in it (`[PROPOSED]` in PIPE-4 — the alternative, re-rendering
 * over his edits, loses them).
 *
 * Send is disabled while anything in double braces remains; the service
 * refuses it regardless. The draft — fields and hand edits — lives in
 * sessionStorage until a send succeeds, the intro email's contract.
 */

type Draft = {
  fields: Record<string, string>;
  subject: string | null;
  body: string | null;
};

function draftKey(engagementId: string, stepId: string) {
  return `step-email-draft:${engagementId}:${stepId}`;
}

function readDraft(key: string): Draft | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    const fields: Record<string, string> = {};
    for (const [name, value] of Object.entries(parsed.fields ?? {})) {
      if (typeof value === "string") fields[name] = value;
    }
    return {
      fields,
      subject: typeof parsed.subject === "string" ? parsed.subject : null,
      body: typeof parsed.body === "string" ? parsed.body : null,
    };
  } catch {
    return null;
  }
}

function writeDraft(key: string, draft: Draft) {
  try {
    sessionStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // Storage full or blocked — the in-memory draft is still the live one.
  }
}

function clearDraft(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Losing the backup is not worth throwing from a send.
  }
}

/** `reviewCode` → "Review code". */
function humanise(name: string): string {
  const words = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const WHEN = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Vancouver",
  dateStyle: "medium",
});

const field =
  "min-h-[44px] rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 text-base text-(--color-ink) outline-none focus-visible:border-(--color-c2)";

export function StepEmailDialog({
  engagementId,
  stepId,
  stepTitle,
  template,
  values,
  recipient,
  businessName,
  moneyLine,
  lastSentAt,
  onClose,
  onSent,
}: {
  engagementId: string;
  stepId: string;
  stepTitle: string;
  template: { subject: string; body: string };
  values: Record<string, string | undefined>;
  recipient: { name: string; email: string };
  businessName: string;
  moneyLine: string;
  /** ISO time of the last delivered send of this step, if any. */
  lastSentAt: string | null;
  onClose: () => void;
  onSent: (message: string) => void;
}) {
  const key = draftKey(engagementId, stepId);
  const names = findTemplateNames(template.subject, template.body);

  const [fields, setFields] = useState<Record<string, string>>(() =>
    Object.fromEntries(names.map((name) => [name, values[name] ?? ""])),
  );
  const [frozenSubject, setFrozenSubject] = useState<string | null>(null);
  const [frozenBody, setFrozenBody] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // A draft left by a failed send or a refresh comes back as it was.
  useEffect(() => {
    const draft = readDraft(key);
    if (!draft) return;
    setFields((current) => ({ ...current, ...draft.fields }));
    setFrozenSubject(draft.subject);
    setFrozenBody(draft.body);
    setRestored(true);
  }, [key]);

  // Escape is the way out, except mid-send.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, pending]);

  const subject = renderPipelineTemplate(
    frozenSubject ?? template.subject,
    fields,
  ).text;
  const body = renderPipelineTemplate(frozenBody ?? template.body, fields).text;
  const leftover = findLeftoverPlaceholders(`${subject}\n${body}`);
  const ready =
    leftover.length === 0 && subject.trim() !== "" && body.trim() !== "";

  function save(next: Draft) {
    writeDraft(key, next);
    setConfirming(false);
    setMessage(null);
  }

  function setField(name: string, value: string) {
    const next = { ...fields, [name]: value };
    setFields(next);
    save({ fields: next, subject: frozenSubject, body: frozenBody });
  }

  function editSubject(value: string) {
    setFrozenSubject(value);
    save({ fields, subject: value, body: frozenBody });
  }

  function editBody(value: string) {
    setFrozenBody(value);
    save({ fields, subject: frozenSubject, body: value });
  }

  function startOver() {
    clearDraft(key);
    setFields(
      Object.fromEntries(names.map((name) => [name, values[name] ?? ""])),
    );
    setFrozenSubject(null);
    setFrozenBody(null);
    setRestored(false);
  }

  function send() {
    startTransition(async () => {
      const typed: Record<string, string> = {};
      for (const [name, value] of Object.entries(fields)) {
        if (value.trim() !== "") typed[name] = value;
      }

      const result = await sendStepEmailAction({
        engagementId,
        stepId,
        subject,
        body,
        values: typed,
      });

      if (result.ok) {
        clearDraft(key);
        onSent(result.note ?? `Sent to ${result.to}.`);
        return;
      }
      // The letter stays exactly as written — a failed send loses nothing.
      setConfirming(false);
      setMessage(result.message);
    });
  }

  const firstMissing = names.find((name) => (fields[name] ?? "").trim() === "");

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:p-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Email for ${stepTitle}`}
        className="w-full max-w-2xl rounded-(--radius) border border-(--color-line) bg-(--color-ground-a) p-6"
      >
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="font-(family-name:--font-display) text-lg text-(--color-ink)">
            {stepTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="min-h-[44px] text-sm text-(--color-dim) underline disabled:opacity-60"
          >
            Cancel
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <dl className="flex flex-col gap-1 text-sm">
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-(--color-dim)">To</dt>
              <dd className="text-(--color-ink)">
                {recipient.name} · {recipient.email}
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-(--color-dim)">Money</dt>
              <dd className="text-(--color-body)">{moneyLine}</dd>
            </div>
          </dl>

          {restored ? (
            <p className="flex flex-wrap items-center gap-3 text-sm text-(--color-c2)">
              Your unsent draft is back.
              <button
                type="button"
                onClick={startOver}
                className="min-h-[44px] text-sm text-(--color-dim) underline"
              >
                Start from the template
              </button>
            </p>
          ) : null}

          {names.length > 0 ? (
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-2 text-sm text-(--color-ink)">
                Values
              </legend>
              {names.map((name) => {
                const missing = (fields[name] ?? "").trim() === "";
                return (
                  <label key={name} className="flex flex-col gap-1.5">
                    <span className="flex flex-wrap items-baseline gap-2 text-sm text-(--color-body)">
                      {humanise(name)}
                      <code className="font-(family-name:--font-mono) text-xs text-(--color-dim)">
                        {`{{${name}}}`}
                      </code>
                      {missing ? (
                        <span className="text-xs text-(--color-c2)">
                          needed
                        </span>
                      ) : null}
                    </span>
                    <input
                      type="text"
                      value={fields[name] ?? ""}
                      onChange={(event) => setField(name, event.target.value)}
                      maxLength={2000}
                      autoFocus={name === firstMissing}
                      aria-invalid={missing ? true : undefined}
                      className={field}
                    />
                  </label>
                );
              })}
            </fieldset>
          ) : null}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-(--color-body)">Subject</span>
            <input
              type="text"
              value={subject}
              onChange={(event) => editSubject(event.target.value)}
              maxLength={300}
              className={field}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-(--color-body)">Message</span>
            <textarea
              value={body}
              onChange={(event) => editBody(event.target.value)}
              rows={16}
              autoFocus={firstMissing === undefined}
              className="rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 py-2 font-(family-name:--font-mono) text-xs leading-relaxed text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
            />
          </label>

          {leftover.length > 0 ? (
            <p className="text-sm text-(--color-dim)">
              Still to fill: {leftover.join(", ")}
            </p>
          ) : null}

          {message ? (
            <p role="alert" className="text-sm text-(--color-c2)">
              {message}
            </p>
          ) : null}

          {confirming ? (
            <div className="flex flex-col gap-3 border-t border-(--color-line-soft) pt-4">
              <p className="text-sm text-(--color-ink)">
                {lastSentAt
                  ? `This step was already sent on ${WHEN.format(new Date(lastSentAt))}. `
                  : ""}
                Send to {recipient.name} at {recipient.email}, for{" "}
                {businessName}?
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={send}
                  disabled={pending}
                  autoFocus
                  className="min-h-[44px] rounded-(--radius) bg-(--color-action) px-4 text-sm font-medium text-white disabled:opacity-60"
                >
                  {pending ? "Sending…" : lastSentAt ? "Send again" : "Send it"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={pending}
                  className="min-h-[44px] text-sm text-(--color-dim) underline disabled:opacity-60"
                >
                  Back to the letter
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setConfirming(true)}
                disabled={!ready || pending}
                className="min-h-[44px] rounded-(--radius) bg-(--color-action) px-4 text-sm font-medium text-white disabled:opacity-60"
              >
                Send
              </button>
              <span className="text-xs text-(--color-dim)">
                From hello@, as plain text.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
