import { GradientButton } from "@/components/ui/GradientButton";
import { stepsFor } from "@/lib/intake/tracks";
import { intakeRoutes } from "@/lib/routes";
import type { Engagement } from "@/server/services/engagement";
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
  const firstName =
    engagement.contactName.split(" ")[0] ?? engagement.contactName;
  const firstStep = stepsFor(engagement.track)[0]!;

  return (
    <div>
      <h1 className="font-display text-h2 leading-[1.15] font-semibold tracking-(--tracking-h2) text-(--color-ink)">
        {engagement.paidAt
          ? `Deposit received — thanks, ${firstName}.`
          : `Hi ${firstName}.`}
      </h1>

      <div className="mt-6 max-w-[48ch] space-y-4 text-[16px] leading-[1.6] text-(--color-body) sm:text-body">
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

      <p className="mt-10 border-t border-(--color-faint) pt-5 text-meta leading-[1.55] text-(--color-dim)">
        Everything you enter here is confidential — it&apos;s used to build your
        site and nothing else.
      </p>
    </div>
  );
}
