import { GradientButton } from "@/components/ui/GradientButton";
import { INTAKE_STEPS } from "@/lib/intake/steps";
import { intakeRoutes } from "@/lib/routes";
import type { Engagement } from "@/server/services/engagement";
import { Eyebrow } from "./eyebrow";
import { SendMyLinkButton } from "./send-my-link-button";

/**
 * W0 — the welcome screen (UX spec §3).
 *
 * Copy is Vesper's, verbatim where the build spec supplies it. Three promises
 * are made here and every later screen has to keep them: about twenty
 * minutes, skip anything, and nothing is lost.
 *
 * The first line changes with money state. A client who just paid should be
 * told the payment landed before anything else is asked of them; a client
 * whose deposit was waived is simply greeted (D-INT-9).
 */
export function Welcome({
  engagement,
  token,
}: {
  engagement: Engagement;
  token: string;
}) {
  const firstName = engagement.contactName.split(" ")[0] ?? engagement.contactName;
  const firstStep = INTAKE_STEPS[0]!;

  return (
    <div>
      <Eyebrow>Agora · Website build</Eyebrow>

      <h1 className="font-display text-[clamp(28px,6vw,38px)] font-medium leading-[1.1] tracking-[-.025em] text-(--color-ink)">
        {engagement.paidAt
          ? `Deposit received — thanks, ${firstName}.`
          : `Hi ${firstName}.`}
      </h1>

      <div className="mt-6 max-w-[48ch] space-y-4 font-body text-[16px] font-light leading-[1.66] text-(--color-body)">
        <p>Everything we need to build your site — about 30 minutes.</p>
        <p>
          Skip anything you&apos;re not sure about; we&apos;ll go through it
          together on our call. Your answers save automatically, so you can stop
          and come back anytime.
        </p>
      </div>

      <div className="mt-9 flex flex-wrap items-center gap-3">
        <GradientButton href={intakeRoutes.step(token, firstStep.key)}>
          Start — {firstStep.title.toLowerCase()}
        </GradientButton>
        <SendMyLinkButton token={token} />
      </div>

      <p className="mt-10 border-t border-(--color-faint) pt-5 font-mono text-[10px] uppercase leading-[1.8] tracking-[.18em] text-(--color-dim)">
        Everything you enter here is confidential — it&apos;s used to build your
        site and nothing else.
      </p>
    </div>
  );
}
