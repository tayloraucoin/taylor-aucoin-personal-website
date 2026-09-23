import Link from "next/link";
import { adminRoutes } from "@/lib/routes";
import { requireAdmin } from "@/server/services/admin-auth";
import { loadReviewRoundSummaries } from "@/server/services/review";

export const dynamic = "force-dynamic";

const WHEN = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Vancouver",
  dateStyle: "medium",
});

/**
 * Every client design-review round (REV-3): who, which round, and what came
 * back. A round is created the first time a client repo reports in
 * (M-REV-6); this page only reads.
 */
export default async function DesignReviewsPage() {
  await requireAdmin();

  const rounds = await loadReviewRoundSummaries();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-(family-name:--font-display) text-xl text-(--color-ink)">
          Design reviews
        </h1>
        <p className="text-sm text-(--color-body)">
          {rounds.length} {rounds.length === 1 ? "round" : "rounds"} ·{" "}
          {rounds.filter((r) => r.submittedAt).length} submitted
        </p>
      </header>

      {rounds.length === 0 ? (
        <p className="text-sm text-(--color-dim)">
          None yet. A round appears the first time a client site sends a comment
          or its form, using the shared{" "}
          <code className="font-(family-name:--font-mono) text-xs">
            REVIEW_INGEST_KEY
          </code>
          .
        </p>
      ) : (
        <ul className="flex flex-col">
          {rounds.map((round) => (
            <li key={round.id}>
              <Link
                href={adminRoutes.designReview(round.id)}
                className="flex min-h-[44px] flex-wrap items-center gap-x-3 gap-y-1 border-l-2 border-transparent px-3 py-2 hover:border-(--color-c2) hover:bg-(--color-tint)/60"
              >
                <span className="text-sm text-(--color-ink)">
                  {round.clientName}
                </span>
                <span className="text-xs text-(--color-dim)">
                  {round.label} · {round.clientApp}
                  {round.engagementId ? "" : " · no engagement linked"}
                </span>

                <span className="ml-auto flex items-center gap-3">
                  <span className="text-xs text-(--color-body)">
                    {round.liveCommentCount}{" "}
                    {round.liveCommentCount === 1 ? "comment" : "comments"}
                  </span>
                  <span className="text-xs text-(--color-body)">
                    {round.submissionCount}{" "}
                    {round.submissionCount === 1 ? "form" : "forms"}
                  </span>
                  <span className="text-xs text-(--color-c2)">
                    {round.submittedAt
                      ? `submitted ${WHEN.format(round.submittedAt)}`
                      : `opened ${WHEN.format(round.createdAt)}`}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
