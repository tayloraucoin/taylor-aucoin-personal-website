import { GradientButton, GhostButton } from "@/components/ui/GradientButton";
import { BOOKING_URL } from "@/lib/config";
import { intakeRoutes } from "@/lib/routes";
import {
  EngagementNotFoundError,
  requireEngagement,
} from "@/server/services/engagement";
import { collectUnanswered } from "@/server/services/output";
import { Eyebrow } from "../../_components/eyebrow";
import { LinkUnavailable } from "../../_components/link-unavailable";
import { CompleteOnArrival } from "../../_components/complete-on-arrival";

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
      <CompleteOnArrival token={token} alreadyComplete={Boolean(engagement.completedAt)} />

      <Eyebrow>Agora · Website build</Eyebrow>

      <h1 className="font-display text-[clamp(28px,6vw,38px)] font-medium leading-[1.1] tracking-[-.025em] text-(--color-ink)">
        That&apos;s everything, {firstName}.
      </h1>

      <p className="mt-5 max-w-[48ch] font-body text-[16px] font-light leading-[1.66] text-(--color-body)">
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
          </ul>
        </section>
      ) : null}
    </div>
  );
}
