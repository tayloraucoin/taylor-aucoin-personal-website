import type { ReactNode } from "react";
import { GhostButton, GradientButton } from "@/components/ui/GradientButton";
import {
  INTAKE_STEP_COUNT,
  type IntakeStep,
  nextStep,
  previousStep,
} from "@/lib/intake/steps";
import { intakeRoutes } from "@/lib/routes";
import { INTAKE_COLUMN } from "../_lib/column";
import { Eyebrow } from "./eyebrow";
import { StepHeading } from "./step-heading";
import { StepProgress } from "./step-progress";

/**
 * One step = one scrollable screen (D-INT-5). The frame is identical on all
 * nine so the client learns it once.
 *
 * The footer is sticky and its Continue is **never disabled**. Every question
 * on this form is optional, so a greyed-out primary button would be the
 * interface lying about what it requires — and a client who cannot proceed is
 * a client who abandons. The one disabled CTA in the whole flow is the pay
 * button while Stripe opens (INT-3).
 *
 * `saveSlot` is where INT-5 hangs the live autosave indicator. It stays a
 * prop rather than a context so the shell can remain a server component and
 * only the form below it ships JavaScript.
 *
 * The footer is a real bar: fixed to the viewport, edge to edge at every
 * width (Taylor's call). Its inner row re-applies `INTAKE_COLUMN`, so Back and
 * Continue line up exactly with the left and right edges of the fields above
 * them — the bar spans the screen, the controls belong to the form.
 *
 * That is what makes `INTAKE_COLUMN` a shared constant rather than a repeated
 * class string: the moment the two copies disagree, the buttons stop landing
 * on the field edges and nothing errors.
 *
 * Fixed takes the bar out of flow, so `main` carries the clearance instead.
 * The bar measures roughly 102px (16 + a 44px control + 10 + 16 + 16); `pb-32`
 * is the next value up the scale and leaves the last field a comfortable
 * margin rather than tucking it under glass.
 */
export function StepShell({
  token,
  step,
  saveSlot,
  children,
}: {
  token: string;
  step: IntakeStep;
  saveSlot?: ReactNode;
  children: ReactNode;
}) {
  const previous = previousStep(step);
  const next = nextStep(step);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mb-8">
        <Eyebrow>{`Step ${step.number} of ${INTAKE_STEP_COUNT}`}</Eyebrow>

        <StepHeading>{step.title}</StepHeading>

        {step.intro ? (
          <p
            className={`mt-3 max-w-[48ch] font-body text-[16px] font-light leading-[1.6] ${
              step.emphasis === "ink"
                ? "text-(--color-ink)"
                : "text-(--color-body)"
            }`}
          >
            {step.intro}
          </p>
        ) : null}

        <StepProgress current={step.number} />
      </header>

      <main className="flex-1 pb-32">{children}</main>

      <footer className="fixed inset-x-0 bottom-0 z-10 border-t border-(--color-faint) bg-(--color-card) backdrop-blur-[6px]">
        <div className={`py-4 ${INTAKE_COLUMN}`}>
          <div className="flex items-center justify-between gap-3">
            {previous ? (
              <GhostButton href={intakeRoutes.step(token, previous.key)}>
                ← Back
              </GhostButton>
            ) : (
              <span />
            )}

            <GradientButton
              href={
                next
                  ? intakeRoutes.step(token, next.key)
                  : intakeRoutes.done(token)
              }
            >
              {next ? "Continue" : "Finish"}
            </GradientButton>
          </div>

          <div className="mt-2.5 flex min-h-4 items-center justify-between gap-3">
            <div>{saveSlot}</div>

            {next ? (
              <p className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
                Next · {next.title}
              </p>
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  );
}
