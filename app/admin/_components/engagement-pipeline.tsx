"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { setStepDoneAction } from "@/app/admin/(protected)/engagements/_actions/pipeline";
import { CopyButton } from "@/app/admin/_components/copy-button";
import { adminRoutes } from "@/lib/routes";

/**
 * The playbook as one engagement's checklist (PIPE-3).
 *
 * Prompts arrive already filled with this client's values — resolved on the
 * server from the engagement id, never chosen here — and copying one says
 * which names it could not fill. Done and undo are optimistic and put
 * themselves back, with a line saying so, when the server refuses.
 */

export type EngagementPipelineItem = {
  id: string;
  title: string;
  archived: boolean;
  /** ISO string; null when not done. */
  completedAt: string | null;
  prompt: string | null;
  promptUnresolved: string[];
  emailSubject: string | null;
};

const WHEN = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Vancouver",
  dateStyle: "medium",
});

export function EngagementPipeline({
  engagementId,
  steps,
}: {
  engagementId: string;
  steps: EngagementPipelineItem[];
}) {
  const [done, setDone] = useState(
    () => new Map(steps.map((step) => [step.id, step.completedAt])),
  );
  const [message, setMessage] = useState("");
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
    setMessage("");

    startTransition(async () => {
      const result = await setStepDoneAction({
        engagementId,
        stepId: step.id,
        done: !wasDone,
      });
      if (result.ok) return;
      setDone((current) => new Map(current).set(step.id, wasDone));
      setMessage(`${step.title}: ${result.message}`);
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
                    completedAt ? `Done ${WHEN.format(new Date(completedAt))}` : null,
                    step.archived ? "Archived step" : null,
                    step.emailSubject ? `Email: ${step.emailSubject}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>

              {step.prompt ? (
                <CopyButton
                  text={step.prompt}
                  label="Copy prompt"
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

      <p role="status" className="min-h-5 text-sm text-(--color-c2)">
        {message}
      </p>
    </div>
  );
}
