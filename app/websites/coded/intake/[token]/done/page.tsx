import { notFound } from "next/navigation";
import { eyebrowFor } from "@/lib/intake/tracks";
import {
  EngagementNotFoundError,
  requireEngagement,
} from "@/server/services/engagement";
import {
  collectUnanswered,
  tasteShortfall,
} from "@/server/services/output";
import { CompleteOnArrival } from "../../../../intake/_components/complete-on-arrival";
import { Eyebrow } from "../../../../intake/_components/eyebrow";
import { LinkUnavailable } from "../../../../intake/_components/link-unavailable";

/**
 * The showcase track's confirmation screen.
 *
 * Copy is `portfolio-intake-questions-v2.md` § Done screen, verbatim. Note what
 * it does *not* carry: no call-booking CTA and no "add more photos" affordance.
 * The durable track offers both; this track's next event is the first look at
 * the site within three days, and adding a booking button would be inventing a
 * step the approved copy does not describe.
 *
 * Everything skipped is listed plainly under "we'll cover these on the call".
 * A client who skipped eleven questions has not failed a form, they have handed
 * us an agenda. When nothing was skipped the block disappears rather than
 * congratulating anyone.
 *
 * The skipped list is honest only once the steps have fields — PORT-4, PORT-5,
 * and PORT-7 fill the schemas it reads, and PORT-8 sweeps for gaps.
 */
export default async function ShowcaseIntakeDonePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let engagement;
  try {
    engagement = await requireEngagement(token);
  } catch (error) {
    if (error instanceof EngagementNotFoundError) {
      return <LinkUnavailable expired={error.reason === "expired"} />;
    }
    throw error;
  }

  if (engagement.track !== "showcase") notFound();

  const unanswered = collectUnanswered(engagement);
  const shortfall = tasteShortfall(engagement);

  return (
    <div>
      <CompleteOnArrival
        token={token}
        alreadyComplete={Boolean(engagement.completedAt)}
      />

      <Eyebrow>{eyebrowFor(engagement.track)}</Eyebrow>

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
    </div>
  );
}
