import { notFound } from "next/navigation";
import Link from "next/link";
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
      <p className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-c2)">
        Your answers
      </p>

      <h1 className="mt-4 font-display text-[30px] font-medium leading-[1.15] tracking-[-.02em] text-(--color-ink)">
        Everything you&rsquo;ve told us
      </h1>

      <p className="mt-3 max-w-[52ch] font-body text-[16px] font-light leading-[1.6] text-(--color-body)">
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
                  <span className="mr-3 font-mono text-[11px] tracking-[.14em] text-(--color-c2)">
                    {String(step.number).padStart(2, "0")}
                  </span>
                  {step.title}
                </p>

                <p className="mt-1 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
                  {spent
                    ? "Read once, and finished."
                    : `${step.answered} of ${step.total} answered`}
                </p>
              </div>

              {spent ? null : (
                <Link
                  href={showcaseIntakeRoutes.step(token, step.key)}
                  className="shrink-0 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-c2) underline-offset-4 hover:underline"
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
