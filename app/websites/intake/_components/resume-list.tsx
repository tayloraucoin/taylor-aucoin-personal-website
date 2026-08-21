import Link from "next/link";
import { GradientButton } from "@/components/ui/GradientButton";
import { INTAKE_STEPS, stepByNumber } from "@/lib/intake/steps";
import { intakeRoutes } from "@/lib/routes";
import type { Engagement } from "@/server/services/engagement";
import { Eyebrow } from "./eyebrow";

/**
 * The returning-client screen (UX spec §5.3).
 *
 * This is the only place step-jumping is offered. Mid-form the flow stays
 * linear — a nine-item menu on every screen is a decision the client has to
 * make nine times — but someone coming back after two days needs to see where
 * they were without walking the whole sequence again.
 *
 * The markers are deliberately quiet: a gold dot for visited, a faint one for
 * untouched. No checkmarks, no counts, no completion percentage. Nothing on
 * this form is required, so "9 of 9" would be a score for a test that does not
 * exist.
 */
export function ResumeList({
  engagement,
  token,
}: {
  engagement: Engagement;
  token: string;
}) {
  const firstName =
    engagement.contactName.split(" ")[0] ?? engagement.contactName;
  const current = stepByNumber(Math.max(engagement.currentStep, 1));

  return (
    <div>
      <Eyebrow>Agora · Website build</Eyebrow>

      <h1 className="font-display text-[clamp(28px,6vw,38px)] font-medium leading-[1.1] tracking-[-.025em] text-(--color-ink)">
        Welcome back, {firstName}.
      </h1>

      <p className="mt-5 max-w-[48ch] font-body text-[16px] font-light leading-[1.66] text-(--color-body)">
        Everything you entered is saved. Pick up where you left off, or jump to
        any step.
      </p>

      <div className="mt-8">
        <GradientButton href={intakeRoutes.step(token, current.key)}>
          Continue — step {current.number}
        </GradientButton>
      </div>

      <ul className="mt-10 border-t border-(--color-faint)">
        {INTAKE_STEPS.map((step) => {
          const visited = step.number <= engagement.currentStep;

          return (
            <li key={step.key} className="border-b border-(--color-faint)">
              <Link
                href={intakeRoutes.step(token, step.key)}
                className="flex min-h-12 items-center gap-4 py-3 transition-colors duration-(--dur-fast) ease-(--ease-out) hover:bg-(--color-card-hover)"
              >
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    visited ? "bg-(--color-c2)" : "bg-(--color-faint)"
                  }`}
                />
                <span className="font-mono text-[10px] tracking-[.18em] text-(--color-c2)">
                  {String(step.number).padStart(2, "0")}
                </span>
                <span className="font-body text-[16px] font-light text-(--color-body)">
                  {step.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
