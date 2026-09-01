import { GradientButton } from "@/components/ui/GradientButton";
import { eyebrowFor, stepsFor } from "@/lib/intake/tracks";
import { showcaseIntakeRoutes } from "@/lib/routes";
import type { Engagement } from "@/server/services/engagement";
import { Eyebrow } from "../../../intake/_components/eyebrow";
import { SendMyLinkButton } from "../../../intake/_components/send-my-link-button";

/**
 * W0 for the showcase track.
 *
 * Its own component rather than a parameterization of the durable welcome,
 * because on this screen the copy *is* the component: three different
 * paragraphs, a different promise about length, and a different first line.
 * Sharing it would mean four copy props and a conditional, which is a worse
 * way to hold two sets of words than two files.
 *
 * Every string below is `portfolio-intake-questions-v2.md` § Welcome screen,
 * verbatim.
 *
 * The first line changes with money state: a client who just paid is told the
 * payment landed before anything else is asked of them; one whose deposit was
 * waived is simply greeted (D-INT-9).
 */
export function ShowcaseWelcome({
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
      <Eyebrow>{eyebrowFor(engagement.track)}</Eyebrow>

      <h1 className="font-display text-[clamp(28px,6vw,38px)] font-medium leading-[1.1] tracking-[-.025em] text-(--color-ink)">
        {engagement.paidAt
          ? `Payment received — thanks, ${firstName}.`
          : `Hi ${firstName}.`}
      </h1>

      <p className="mt-6 font-display text-[22px] font-medium leading-[1.2] tracking-[-.02em] text-(--color-ink)">
        Nine steps. Every one of them optional but encouraged.
      </p>

      <div className="mt-5 max-w-[48ch] space-y-4 font-body text-[16px] font-light leading-[1.66] text-(--color-body)">
        <p>
          Budget about 45 minutes — longer if your back catalogue runs deep. It
          saves as you type, so leave and come back whenever; your link always
          brings you back to where you were.
        </p>
        <p>
          Skip anything. A skipped question just means we ask on a call, or
          leave it out. The more you give us here, the closer the first version
          lands to the site you actually want.
        </p>
      </div>

      <div className="mt-9 flex flex-wrap items-center gap-4">
        <GradientButton href={showcaseIntakeRoutes.step(token, firstStep.key)}>
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
