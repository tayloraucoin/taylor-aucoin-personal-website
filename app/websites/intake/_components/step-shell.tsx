import { randomUUID } from "node:crypto";
import type { ReactNode } from "react";
import { GhostButton, GradientButton } from "@/components/ui/GradientButton";
import { nextStep, previousStep, stepCountFor } from "@/lib/intake/tracks";
import type { ShowcaseFlavour } from "@/lib/intake/showcase-copy";
import { intakeRoutesFor } from "@/lib/routes";
import type {
  AnyIntakeStepKey,
  IntakeStep,
  IntakeTrackKey,
} from "@/lib/types/intake";
import { INTAKE_COLUMN } from "../_lib/column";
import { FooterEnd } from "../_lib/save-state";
import { Eyebrow } from "./eyebrow";
import { RefreshIfStale } from "./refresh-if-stale";
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
 *
 * Every render is stamped with an id, and `main` is keyed by it. Two things
 * depend on that. `RefreshIfStale` uses the id to tell a fresh render from one
 * the client router replayed from its cache — see that file for the Next
 * behaviour it guards against. And because a `router.refresh()` preserves
 * client state by design, the key is what makes a refreshed render re-seed the
 * step's form: `useStepAutosave` reads `initial` once, on mount, so without a
 * remount a refresh would fetch the right answers and show the old ones. The
 * in-step refreshes (`step-proposals`, `source-list`, `step-ingest`) rely on
 * the same remount. Nothing typed is lost to it: an unsaved edit is already in
 * localStorage and rehydrates on mount, and a saved one is in `initial`.
 */
export function StepShell({
  track,
  token,
  step,
  flavour = "generic",
  navigate,
  previousLocked = false,
  saveSlot,
  children,
}: {
  track: IntakeTrackKey;
  token: string;
  step: IntakeStep;
  /**
   * This client's copy pack, so the footer's "Next · …" names the step they
   * are actually about to meet. Step 5 is "The work" for a portfolio and
   * "What you offer" for a practice; without this the bar promised the wrong
   * one to four of the six packs.
   */
  flavour?: ShowcaseFlavour;
  /**
   * Where Back and Continue point, when it is not this client's own flow.
   *
   * The admin preview mounts this shell so a section can be judged as the
   * screen it is, chrome and all — but its steps live under `/admin/intake/
   * preview/...` and it has no token to build a client route from. Overriding
   * the two destinations is the whole of what it needs; everything else about
   * the bar is the same bar (Taylor, 2026-09-04).
   */
  navigate?: { step: (stepKey: AnyIntakeStepKey) => string; done: string };
  /**
   * Renders Back as unavailable even though a previous step exists.
   *
   * One step behind this one may be spent rather than merely visited — the
   * coded track's ingestion run is read-once, and its page redirects forward
   * on a second visit. Without this the Back button would land there and be
   * bounced straight back, which reads as a broken control rather than a
   * closed door.
   */
  previousLocked?: boolean;
  saveSlot?: ReactNode;
  children: ReactNode;
}) {
  const previous = previousStep(track, step, flavour);
  const next = nextStep(track, step, flavour);
  const stepCount = stepCountFor(track);
  const routes = intakeRoutesFor(track);
  const go = navigate ?? {
    step: (stepKey: AnyIntakeStepKey) => routes.step(token, stepKey),
    done: routes.done(token),
  };
  const renderId = randomUUID();

  return (
    <div className="flex min-h-dvh flex-col">
      <RefreshIfStale renderId={renderId} />

      <header className="mb-8">
        <Eyebrow>{`Step ${step.number} of ${stepCount}`}</Eyebrow>

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

        <StepProgress track={track} current={step.number} />
      </header>

      <main key={renderId} className="flex-1 pb-32">
        {children}
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-10 border-t border-(--color-faint) bg-(--color-card) backdrop-blur-[6px]">
        <div className={`py-4 ${INTAKE_COLUMN}`}>
          <div className="flex items-center justify-between gap-3">
            {/* Back is present on the first step too, disabled rather than
                absent. An empty placeholder left the bar lopsided and moved
                Continue between steps one and two; a control that is visibly
                unavailable teaches where it will be. */}
            {previous && !previousLocked ? (
              <GhostButton href={go.step(previous.key)}>← Back</GhostButton>
            ) : (
              <GhostButton disabled>← Back</GhostButton>
            )}

            <GradientButton
              href={next ? go.step(next.key) : go.done}
              className="min-w-[11rem] justify-center"
            >
              {next ? "Continue" : "Finish"}
            </GradientButton>
          </div>

          <div className="mt-2.5 flex min-h-4 items-center justify-between gap-3">
            <div>{saveSlot}</div>

            {/* A step may take this slot for a line of its own — the taste
                step publishes its picks count here (D-PORT-16). Every step
                that publishes nothing renders exactly what it always did. */}
            <FooterEnd
              fallback={
                next ? (
                  <p className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
                    Next · {next.title}
                  </p>
                ) : null
              }
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
