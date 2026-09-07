import { GhostButton } from "@/components/ui/GradientButton";
import { eyebrowFor } from "@/lib/intake/tracks";
import { showcaseIntakeRoutes } from "@/lib/routes";
import type { IntakeTrackKey } from "@/lib/types/intake";
import { Eyebrow } from "../../../intake/_components/eyebrow";
import { FeedbackBlock } from "./feedback-block";

/** One step's worth of questions nobody answered. */
export type UnansweredGroup = { step: string; labels: readonly string[] };

/**
 * The showcase track's done screen, as a component.
 *
 * Extracted from the route (2026-09-04) so the admin preview can render the
 * same screen. The route still owns the reads — the engagement, what was
 * skipped, the taste shortfall — and `CompleteOnArrival` stays up there with
 * them, because marking an engagement complete is a thing the shell does on a
 * real visit and must never happen because someone opened a preview.
 *
 * Copy is `portfolio-intake-questions-v2.md` § Done screen, verbatim. Note
 * what it does *not* carry: no call-booking CTA and no "add more photos"
 * affordance. The durable track offers both; this track's next event is the
 * first look at the site within three days, and adding a booking button would
 * be inventing a step the approved copy does not describe.
 *
 * Everything skipped is listed plainly under "we'll cover these on the call".
 * A client who skipped eleven questions has not failed a form, they have handed
 * us an agenda. When nothing was skipped the block disappears rather than
 * congratulating anyone.
 */
export function ShowcaseDone({
  track,
  token,
  unanswered,
  shortfall,
}: Readonly<{
  track: IntakeTrackKey;
  token: string;
  unanswered: readonly UnansweredGroup[];
  shortfall: string | null;
}>) {
  return (
    <div>
      <Eyebrow>{eyebrowFor(track)}</Eyebrow>

      <h1 className="font-display text-[clamp(28px,6vw,38px)] font-medium leading-[1.1] tracking-[-.025em] text-(--color-ink)">
        That&apos;s everything.
      </h1>

      <p className="mt-5 max-w-[48ch] font-body text-[16px] font-light leading-[1.66] text-(--color-body)">
        Taylor reads all of it — every note, every rating, every file.
        You&apos;ll see the first look at your site within three days. If
        anything below is easy to answer by text, it all helps.
      </p>

      {unanswered.length > 0 || shortfall ? (
        <section className="mt-12 border-t border-(--color-faint) pt-6">
          <h2 className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-dim)">
            We&apos;ll cover these on the call
          </h2>

          <ul className="mt-4 space-y-3">
            {unanswered.map((group) => (
              <li key={group.step}>
                <p className="font-body text-[13.5px] font-light leading-[1.6] text-(--color-body)">
                  <span className="text-(--color-ink)">{group.step}</span>
                  {" — "}
                  {group.labels.join(", ").toLowerCase()}
                </p>
              </li>
            ))}

            {/* A stated ask that was not met is not an unanswered question —
                they answered, with fewer. Recorded rather than enforced:
                Continue was never disabled over it (D-INT-4, D-PORT-16). */}
            {shortfall ? (
              <li>
                <p className="font-body text-[13.5px] font-light leading-[1.6] text-(--color-body)">
                  {shortfall}
                </p>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

      {/* The way back in. Until this existed, a client who finished could
          reach their own answers only by editing a URL by hand — and the
          commonest thing anybody wants after sending a long form is to change
          one line of it. [COPY — draft, pending Taylor] */}
      <section className="mt-12 border-t border-(--color-faint) pt-6">
        <h2 className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-dim)">
          Changed your mind about something?
        </h2>

        <p className="mt-4 max-w-[52ch] font-body text-[13.5px] font-light leading-[1.6] text-(--color-body)">
          Everything you answered is still here, and still yours to edit. Taylor
          reads the latest version, so keep this link.
        </p>

        <div className="mt-4">
          <GhostButton href={showcaseIntakeRoutes.review(token)}>
            Review my answers
          </GhostButton>
        </div>
      </section>

      {/* Last on the screen, and behind a button. See `FeedbackBlock` for why
          it is asked here rather than anywhere in the questionnaire. */}
      <FeedbackBlock token={token} />
    </div>
  );
}
