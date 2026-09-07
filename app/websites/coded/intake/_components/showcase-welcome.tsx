import { GradientButton } from "@/components/ui/GradientButton";
import { eyebrowFor, flavourFor, stepsFor } from "@/lib/intake/tracks";
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
/**
 * The count as a word, because the approved sentence opens with one. A count
 * outside this table prints as digits rather than as nothing.
 */
const STEP_COUNT_WORDS: Record<number, string> = {
  9: "Nine",
  10: "Ten",
  11: "Eleven",
};

export function ShowcaseWelcome({
  engagement,
  token,
}: {
  engagement: Engagement;
  token: string;
}) {
  const firstName =
    engagement.contactName.split(" ")[0] ?? engagement.contactName;

  // The client's own pack, not the default. Step 5 is titled "The work" for a
  // portfolio, "What you offer" for a practice, "What you're building" for a
  // venture — so a list built from the generic registry would name a step this
  // client never meets. The start form has already asked kind and discipline
  // by the time this screen renders, so the pack is known here.
  const steps = stepsFor(
    engagement.track,
    flavourFor(engagement.track, engagement.answers),
  );
  const firstStep = steps[0]!;

  return (
    <div>
      <Eyebrow>{eyebrowFor(engagement.track)}</Eyebrow>

      <h1 className="font-display text-[clamp(28px,6vw,38px)] font-medium leading-[1.1] tracking-[-.025em] text-(--color-ink)">
        {engagement.paidAt
          ? `Payment received — thanks, ${firstName}.`
          : `Hi ${firstName}.`}
      </h1>

      {/* "Nine steps." was v2, verbatim, until PORT-18 added the ingestion
          step (Taylor, 2026-09-03). The count is the registry's so this line
          cannot drift from the shell's "Step 1 of N" again; the rest of the
          sentence is v2. [COPY — pending Taylor] on the number word only. */}
      <p className="mt-6 font-display text-[22px] font-medium leading-[1.2] tracking-[-.02em] text-(--color-ink)">
        {STEP_COUNT_WORDS[steps.length] ?? String(steps.length)} steps. Every
        one of them optional but encouraged.
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
        {/* The step's own name came next on screen anyway, so the button was
            saying it twice. [COPY — draft, pending Taylor] */}
        <GradientButton href={showcaseIntakeRoutes.step(token, firstStep.key)}>
          Start →
        </GradientButton>

        <SendMyLinkButton token={token} />
      </div>

      {/*
        What the ten steps actually are.

        Titles come from the registry, so this cannot drift from the steps
        themselves or from the count promised above — both read the same array
        (D-INT-5's reasoning, applied to the names as well as the number).

        Deliberately not links. Step-jumping is offered on the returning-client
        screen and nowhere else: mid-form the flow is linear, and a client who
        has not started yet has no reason to pick a step out of order (see
        `ResumeList`). No visited markers either — nothing has been visited, so
        the dot would carry no information.

        It sits below the CTA rather than above it. Someone who has just paid
        should reach "start" before a list of ten things they owe, and the
        reassurance about skipping and saving should land before the list, not
        after it.
      */}
      <section className="mt-12">
        <h2 className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
          {/* [COPY — pending Taylor] */}
          What we&apos;ll ask
        </h2>

        <ol className="mt-4 border-t border-(--color-faint)">
          {steps.map((step) => (
            <li
              key={step.key}
              className="flex items-center gap-4 border-b border-(--color-faint) py-2.5"
            >
              <span className="font-mono text-[10px] tracking-[.18em] text-(--color-c2)">
                {String(step.number).padStart(2, "0")}
              </span>
              <span className="font-body text-[16px] font-light text-(--color-body)">
                {step.title}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-10 border-t border-(--color-faint) pt-5 font-mono text-[10px] uppercase leading-[1.8] tracking-[.18em] text-(--color-dim)">
        Everything you enter here is confidential — it&apos;s used to build your
        site and nothing else.
      </p>
    </div>
  );
}
