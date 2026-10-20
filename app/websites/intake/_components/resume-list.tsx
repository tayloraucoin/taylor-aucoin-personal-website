import Link from "next/link";
import { GradientButton } from "@/components/ui/GradientButton";
import { flavourFor, stepByNumber, stepsFor } from "@/lib/intake/tracks";
import { intakeRoutesFor } from "@/lib/routes";
import type { Engagement } from "@/server/services/engagement";
import { BODY, H1 } from "../_lib/type";

/**
 * The returning-client screen (UX spec §5.3).
 *
 * This is the only place step-jumping is offered. Mid-form the flow stays
 * linear — a nine-item menu on every screen is a decision the client has to
 * make nine times — but someone coming back after two days needs to see where
 * they were without walking the whole sequence again.
 *
 * The markers are deliberately quiet: a mark dot for visited, a strong-border ring for
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
  // The client's own pack. Without it this list reads the generic registry and
  // names step 5 "The work" for every showcase client, including the ones whose
  // step 5 is titled "What you offer" — a step title that disagrees with the
  // step's own screen. Durable has no packs, so this resolves to generic there
  // and nothing changes.
  const flavour = flavourFor(engagement.track, engagement.answers);
  const current = stepByNumber(
    engagement.track,
    Math.max(engagement.currentStep, 1),
    flavour,
  );
  const routes = intakeRoutesFor(engagement.track);

  return (
    <div>
      <h1 className={H1}>Welcome back, {firstName}.</h1>

      <p className={`mt-5 max-w-[48ch] ${BODY}`}>
        Everything you entered is saved. Pick up where you left off, or jump to
        any step.
      </p>

      <div className="mt-8">
        <GradientButton href={routes.step(token, current.key)}>
          Continue — step {current.number}
        </GradientButton>
      </div>

      {/* The numbered step row (plumb-proposals-2): a 6px dot, mark when
          visited and a strong-border ring when not, a muted number column and
          the title as a text link, the current one at 500 (D-SITE-159). The
          dot is hidden, so a visited row carries a hidden word and the current
          one `aria-current` (intake-coded-build.md, Names). */}
      <ol className="mt-10 border-t border-(--color-faint)">
        {stepsFor(engagement.track, flavour).map((step) => {
          const isCurrent = step.number === current.number;
          const visited = step.number < current.number;

          return (
            <li key={step.key} className="border-b border-(--color-faint)">
              <Link
                href={routes.step(token, step.key)}
                aria-current={isCurrent ? "step" : undefined}
                className="group flex min-h-12 items-center gap-3 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
              >
                <span
                  aria-hidden
                  className={`size-1.5 shrink-0 rounded-full ${
                    visited
                      ? "bg-(--color-mark)"
                      : "border border-(--color-border-strong)"
                  }`}
                />
                <span
                  aria-hidden
                  className="w-7 shrink-0 text-meta text-(--color-dim) tabular-nums"
                >
                  {step.number}
                </span>
                <span
                  className={`text-small text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 group-hover:decoration-2 ${
                    isCurrent ? "font-medium" : ""
                  }`}
                >
                  {step.title}
                </span>
                {visited ? <span className="sr-only"> [done]</span> : null}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
