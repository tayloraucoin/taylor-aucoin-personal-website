import { GhostButton, GradientButton } from "@/components/ui/GradientButton";
import { BOOKING_URL } from "@/lib/config";
import { intakeRoutes } from "@/lib/routes";
import {
  EngagementNotFoundError,
  requireEngagement,
} from "@/server/services/engagement";
import { collectUnanswered } from "@/server/services/output";
import { CompleteOnArrival } from "../../_components/complete-on-arrival";
import { LinkUnavailable } from "../../_components/link-unavailable";

/**
 * The confirmation screen.
 *
 * Everything skipped is listed plainly under "we'll cover these on the call".
 * That framing is the whole point: a client who skipped eleven questions has
 * not failed a form, they have handed us an agenda. Rendering the same list as
 * errors would punish exactly the behaviour the form asked for.
 *
 * When nothing was skipped the block disappears rather than saying "nothing" —
 * an empty state congratulating someone is noise.
 */
export default async function IntakeDonePage({
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

  const firstName =
    engagement.contactName.split(" ")[0] ?? engagement.contactName;
  const unanswered = collectUnanswered(engagement);

  return (
    <div>
      <CompleteOnArrival
        token={token}
        alreadyComplete={Boolean(engagement.completedAt)}
      />

      <h1 className="font-display text-h2 leading-[1.15] font-semibold tracking-(--tracking-h2) text-(--color-ink)">
        That&apos;s everything, {firstName}.
      </h1>

      <p className="mt-5 max-w-[48ch] text-[16px] leading-[1.6] text-(--color-body) sm:text-(length:--text-body)">
        Taylor reads all of this before your call, so the call is short.
      </p>

      <div className="mt-9 flex flex-wrap items-center gap-3">
        <GradientButton href={BOOKING_URL}>Book your call</GradientButton>
        <GhostButton href={intakeRoutes.step(token, "photos")}>
          Add more photos
        </GhostButton>
      </div>

      {unanswered.length > 0 ? (
        <section className="mt-12 border-t border-(--color-faint) pt-6">
          <h2 className="font-display text-h4 leading-[1.3] font-semibold tracking-(--tracking-h4) text-(--color-ink)">
            We&apos;ll cover these on the call
          </h2>

          <ul className="mt-4 space-y-3">
            {unanswered.map((group) => (
              <li key={group.step}>
                <p className="text-meta leading-[1.55] text-(--color-body)">
                  <span className="text-(--color-ink)">{group.step}</span>
                  {" — "}
                  {group.labels.join(", ").toLowerCase()}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
