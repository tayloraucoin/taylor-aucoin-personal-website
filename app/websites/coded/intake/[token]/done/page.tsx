import { notFound } from "next/navigation";
import {
  EngagementNotFoundError,
  requireEngagement,
} from "@/server/services/engagement";
import { galleryForEngagement } from "@/server/services/example-sites";
import { collectUnanswered, tasteShortfall } from "@/server/services/output";
import { ShowcaseDone } from "../../_components/showcase-done";
import { CompleteOnArrival } from "../../../../intake/_components/complete-on-arrival";
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

  // The shortfall line is silent when the client was shown no gallery — they
  // cannot fall short of picking from a screen we never rendered — so this
  // resolves the same set the step did rather than assuming one existed.
  const shortfall = tasteShortfall(
    engagement,
    await galleryForEngagement(engagement),
  );

  return (
    <>
      <CompleteOnArrival
        token={token}
        alreadyComplete={Boolean(engagement.completedAt)}
      />

      <ShowcaseDone
        track={engagement.track}
        token={token}
        unanswered={unanswered}
        shortfall={shortfall}
      />
    </>
  );
}
