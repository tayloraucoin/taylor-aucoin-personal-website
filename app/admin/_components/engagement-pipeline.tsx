"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { CopyButton } from "@/app/admin/_components/copy-button";
import { StepEmailDialog } from "@/app/admin/_components/step-email-dialog";
import { setStepDoneAction } from "@/app/admin/(protected)/engagements/_actions/pipeline";
import { adminRoutes } from "@/lib/routes";
import { PROMPT_TARGET_LABELS, type PromptTarget } from "@/lib/types/pipeline";

/**
 * The playbook as one engagement's checklist (PIPE-3).
 *
 * Prompts arrive already filled with this client's values — resolved on the
 * server from the engagement id, never chosen here — and copying one says
 * which names it could not fill. Done and undo are optimistic and put
 * themselves back, with a line saying so, when the server refuses.
 *
 * An email step opens the send dialog (PIPE-4) and lists every send of it
 * to this client under its title, failed attempts included.
 */

export type EngagementPipelineItem = {
  id: string;
  title: string;
  archived: boolean;
  /** ISO string; null when not done. */
  completedAt: string | null;
  prompt: string | null;
  promptTarget: PromptTarget | null;
  promptUnresolved: string[];
  email: { subject: string; body: string } | null;
  /** ISO times; `delivered` false for an attempt the provider refused. */
  sends: { at: string; delivered: boolean }[];
};

/** What every email step on this engagement is sent with (PIPE-4). */
export type EngagementEmailContext = {
  recipient: { name: string; email: string };
  businessName: string;
  moneyLine: string;
  values: Record<string, string | undefined>;
};

const WHEN = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Vancouver",
  dateStyle: "medium",
});

const WHEN_TIME = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Vancouver",
  dateStyle: "medium",
  timeStyle: "short",
});

export function EngagementPipeline({
  engagementId,
  steps,
  emailContext,
}: {
  engagementId: string;
  steps: EngagementPipelineItem[];
  emailContext: EngagementEmailContext;
}) {
  const [done, setDone] = useState(
    () => new Map(steps.map((step) => [step.id, step.completedAt])),
  );
  const [message, setMessage] = useState<{
    text: string;
    failed: boolean;
  } | null>(null);
  const [writing, setWriting] = useState<EngagementPipelineItem | null>(null);
  const [pending, startTransition] = useTransition();

  // The server's record is the truth; take it whenever it changes.
  useEffect(() => {
    setDone(new Map(steps.map((step) => [step.id, step.completedAt])));
  }, [steps]);

  if (steps.length === 0) {
    return (
      <p className="text-sm text-(--color-dim)">
        No pipeline steps yet.{" "}
        <Link href={adminRoutes.pipeline} className="underline">
          Set up the pipeline
        </Link>
        .
      </p>
    );
  }

  function toggle(step: EngagementPipelineItem) {
    const wasDone = done.get(step.id) ?? null;
    const next = new Map(done);
    next.set(step.id, wasDone ? null : new Date().toISOString());
    setDone(next);
    setMessage(null);

    startTransition(async () => {
      const result = await setStepDoneAction({
        engagementId,
        stepId: step.id,
        done: !wasDone,
      });
      if (result.ok) return;
      setDone((current) => new Map(current).set(step.id, wasDone));
      setMessage({ text: `${step.title}: ${result.message}`, failed: true });
    });
  }

  // Active steps come first (the service orders them so), so an active
  // step's number is its index; archived rows below carry none.
  return (
    <div className="flex flex-col gap-2">
      <ol className="flex flex-col">
        {steps.map((step, index) => {
          const completedAt = done.get(step.id) ?? null;

          return (
            <li
              key={step.id}
              className="flex min-h-[56px] flex-wrap items-center gap-x-3 gap-y-1 border-t border-(--color-line-soft) py-2"
            >
              <span className="w-6 text-right font-(family-name:--font-mono) text-xs text-(--color-dim)">
                {step.archived ? "" : index + 1}
              </span>

              <span className="flex min-w-0 flex-1 flex-col">
                <span
                  className={`text-sm ${completedAt ? "text-(--color-body)" : "text-(--color-ink)"}`}
                >
                  {step.title}
                </span>
                <span className="text-xs text-(--color-dim)">
                  {[
                    completedAt
                      ? `Done ${WHEN.format(new Date(completedAt))}`
                      : null,
                    step.archived ? "Archived step" : null,
                    step.email ? `Email: ${step.email.subject}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                {step.sends.map((send) => (
                  <span
                    key={send.at}
                    className={`text-xs ${send.delivered ? "text-(--color-body)" : "text-(--color-c2)"}`}
                  >
                    {send.delivered
                      ? `Sent ${WHEN_TIME.format(new Date(send.at))}`
                      : `Not sent — ${WHEN_TIME.format(new Date(send.at))}`}
                  </span>
                ))}
              </span>

              {step.email ? (
                <button
                  type="button"
                  onClick={() => {
                    setMessage(null);
                    setWriting(step);
                  }}
                  aria-label={`Write the email for ${step.title}`}
                  className="min-h-[44px] rounded-(--radius) border border-(--color-line-strong) px-3 text-sm text-(--color-ink) hover:bg-(--color-card-hover) focus-visible:border-(--color-c2) focus-visible:outline-none"
                >
                  Write email
                </button>
              ) : null}

              {step.prompt ? (
                <CopyButton
                  text={step.prompt}
                  label={
                    step.promptTarget
                      ? `Copy for ${PROMPT_TARGET_LABELS[step.promptTarget]}`
                      : "Copy prompt"
                  }
                  accessibleLabel={`Copy the prompt for ${step.title}`}
                  copiedMessage={
                    step.promptUnresolved.length > 0
                      ? `Copied. Not filled: ${step.promptUnresolved.join(", ")}`
                      : "Copied"
                  }
                />
              ) : null}

              <button
                type="button"
                onClick={() => toggle(step)}
                disabled={pending}
                aria-pressed={completedAt !== null}
                aria-label={`${completedAt ? "Undo" : "Mark done"}: ${step.title}`}
                className="min-h-[44px] px-2 text-sm text-(--color-dim) underline disabled:opacity-60"
              >
                {completedAt ? "Undo" : "Mark done"}
              </button>
            </li>
          );
        })}
      </ol>

      <p
        role="status"
        className={`min-h-5 text-sm ${message?.failed ? "text-(--color-c2)" : "text-(--color-body)"}`}
      >
        {message?.text ?? ""}
      </p>

      {writing?.email ? (
        <StepEmailDialog
          engagementId={engagementId}
          stepId={writing.id}
          stepTitle={writing.title}
          template={writing.email}
          values={emailContext.values}
          recipient={emailContext.recipient}
          businessName={emailContext.businessName}
          moneyLine={emailContext.moneyLine}
          lastSentAt={
            writing.sends.filter((send) => send.delivered).at(-1)?.at ?? null
          }
          onClose={() => setWriting(null)}
          onSent={(text) => {
            setWriting(null);
            setMessage({ text: `${writing.title}: ${text}`, failed: false });
          }}
        />
      ) : null}
    </div>
  );
}
