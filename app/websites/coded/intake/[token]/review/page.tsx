import { randomUUID } from "node:crypto";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GhostButton } from "@/components/ui/GradientButton";
import { readIngestionRecord } from "@/lib/intake/ingestion-record";
import { flavourFor } from "@/lib/intake/tracks";
import { showcaseIntakeRoutes } from "@/lib/routes";
import {
  EngagementNotFoundError,
  requireEngagement,
} from "@/server/services/engagement";
import { answerTally } from "@/server/services/output";
import { LinkUnavailable } from "../../../../intake/_components/link-unavailable";
import { RefreshIfStale } from "../../../../intake/_components/refresh-if-stale";

/**
 * Everything this client has answered, and the way back into any of it.
 *
 * **The steps are the editor.** Nothing here is a second form: each row links
 * into the step that owns those questions, which already autosaves, already
 * carries the right copy for their kind, and is already the one place each
 * answer is written. A separate edit surface would be a second implementation
 * of every question in the flow and a second thing to keep in step with the
 * copy pack.
 *
 * So this page is a table of contents with counts. It exists because there was
 * no way back in at all once a client reached the done screen: their answers
 * were reachable only by editing a URL by hand.
 *
 * **Authentication is the link itself**, exactly as it is on every other page
 * in this tree — `requireEngagement` and nothing else. A client who lost the
 * link asks for it by email and it arrives at the address on the engagement,
 * which is the property that matters: possession of the inbox, not possession
 * of the URL.
 *
 * The ingestion step is listed but never linked. It is spent once and its own
 * page redirects forward, so offering a way in would be offering a door that
 * moves you along the corridor.
 *
 * [COPY — draft, pending Taylor]
 */
export default async function ShowcaseIntakeReviewPage({
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

  const flavour = flavourFor(engagement.track, engagement.answers);
  const steps = answerTally(engagement, flavour);
  const ingestionRan = readIngestionRecord(engagement.answers) !== null;

  return (
    <div className="py-2">
      {/* The counts are read on the server, so a return here after editing a
          step is exactly the replayed render `RefreshIfStale` exists for. No
          key on the list: nothing below holds client state to re-seed. */}
      <RefreshIfStale renderId={randomUUID()} />

      <p className="font-display text-h4 leading-[1.3] font-semibold tracking-(--tracking-h4) text-(--color-ink)">
        Your answers
      </p>

      <h1 className="mt-4 font-display text-h2 leading-[1.15] font-semibold tracking-(--tracking-h2) text-(--color-ink)">
        Everything you&rsquo;ve told us
      </h1>

      <p className="mt-3 max-w-[52ch] text-[16px] leading-[1.6] text-(--color-body) sm:text-(length:--text-body)">
        Open any section to change what&rsquo;s in it. Your answers save as you
        type, and Taylor sees the latest version — so this link is worth
        keeping.
      </p>

      <ul className="mt-8">
        {steps.map((step) => {
          const spent = step.key === "ingest" && ingestionRan;

          return (
            <li
              key={step.key}
              className="flex items-baseline justify-between gap-4 border-t border-(--color-faint) py-4"
            >
              <div>
                <p className="font-body text-[16px] font-medium leading-[1.4] text-(--color-ink)">
                  <span className="mr-3 text-meta text-(--color-dim) tabular-nums">
                    {String(step.number).padStart(2, "0")}
                  </span>
                  {step.title}
                </p>

                <p className="mt-1 text-meta leading-[1.55] text-(--color-dim)">
                  {spent
                    ? "Read once, and finished."
                    : `${step.answered} of ${step.total} answered`}
                </p>
              </div>

              {spent ? null : (
                <Link
                  href={showcaseIntakeRoutes.step(token, step.key)}
                  className="inline-flex min-h-11 shrink-0 items-center text-meta text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 hover:decoration-2"
                >
                  Open
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-10 border-t border-(--color-faint) pt-7">
        <GhostButton href={showcaseIntakeRoutes.done(token)}>
          ← Back
        </GhostButton>
      </div>
    </div>
  );
}
