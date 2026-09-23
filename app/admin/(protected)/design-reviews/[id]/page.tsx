import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { adminRoutes } from "@/lib/routes";
import type { ReviewComment } from "@/lib/types/review";
import { requireAdmin } from "@/server/services/admin-auth";
import { loadReviewRoundDetail } from "@/server/services/review";
import { ReviewAnswersView } from "./_components/review-answers";

export const dynamic = "force-dynamic";

const WHEN = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Vancouver",
  dateStyle: "medium",
  timeStyle: "short",
});

/** The three free-text boxes every client form carries (contract §4). */
const WORDS = [
  { key: "flinch", label: "What made them flinch" },
  { key: "fightFor", label: "What they'd fight for" },
  { key: "notes", label: "Anything else / general impressions" },
] as const;

/** Comments by the page they were left on, pages in first-comment order. */
function byPath(comments: ReviewComment[]): [string, ReviewComment[]][] {
  const groups = new Map<string, ReviewComment[]>();
  for (const comment of comments) {
    const list = groups.get(comment.path) ?? [];
    list.push(comment);
    groups.set(comment.path, list);
  }
  return [...groups.entries()];
}

/** An absolute link to the page on the client's site, when the round knows it. */
function siteHref(siteUrl: string | null, path: string): string | null {
  if (!siteUrl) return null;
  try {
    return new URL(path, siteUrl).toString();
  } catch {
    return null;
  }
}

/**
 * One design-review round (REV-3): every form the client sent, with each
 * structured answer and note, and every live comment grouped by the page it
 * was pinned on. Read-only; answer labels come from the stored snapshot.
 */
export default async function DesignReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const detail = await loadReviewRoundDetail(id);
  if (!detail) notFound();

  const { round, submissions, comments, deletedCommentCount } = detail;

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <div className="flex flex-col gap-3">
        <Link
          href={adminRoutes.designReviews}
          className="w-fit text-sm text-(--color-dim) underline"
        >
          All design reviews
        </Link>

        <h1 className="font-(family-name:--font-display) text-xl text-(--color-ink)">
          {round.clientName}
        </h1>

        <p className="text-sm text-(--color-body)">
          {round.label} · opened {WHEN.format(round.createdAt)}
          {round.submittedAt
            ? ` · first submitted ${WHEN.format(round.submittedAt)}`
            : " · not submitted yet"}
        </p>

        {round.siteUrl ? (
          <a
            href={round.siteUrl}
            target="_blank"
            rel="noreferrer"
            className="w-fit text-sm text-(--color-dim) underline"
          >
            {round.siteUrl}
          </a>
        ) : null}

        {round.engagementId ? (
          <Link
            href={adminRoutes.engagement(round.engagementId)}
            className="w-fit text-sm text-(--color-dim) underline"
          >
            The engagement
          </Link>
        ) : null}
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm text-(--color-ink)">
          Feedback forms ({submissions.length})
        </h2>

        {submissions.length === 0 ? (
          <p className="text-sm text-(--color-dim)">
            Nothing sent yet. Comments arrive as they are left; the form comes
            when they press send.
          </p>
        ) : (
          submissions.map(({ id: submissionId, receivedAt, payload }, i) => (
            <article
              key={submissionId}
              className="flex flex-col gap-5 rounded-(--radius) border border-(--color-line-soft) bg-(--color-well) p-4"
            >
              <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-sm text-(--color-ink)">
                  {submissions.length > 1
                    ? `Form ${i + 1} of ${submissions.length}`
                    : "Form"}
                </h3>
                <span className="text-xs text-(--color-dim)">
                  received {WHEN.format(receivedAt)} · {payload.commentCount}{" "}
                  unsent comments counted in their browser
                </span>
              </header>

              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <dt className="text-(--color-dim)">Kit</dt>
                <dd className="text-(--color-body)">
                  {payload.preferredKit ?? "—"}
                </dd>
                <dt className="text-(--color-dim)">Layout</dt>
                <dd className="text-(--color-body)">
                  {payload.preferredLayout ?? "—"}
                </dd>
                <dt className="text-(--color-dim)">Demo</dt>
                <dd className="text-(--color-body)">
                  {payload.preferredMock ?? "—"}
                </dd>
              </dl>

              <ReviewAnswersView answers={payload.answers} />

              <div className="flex flex-col gap-3">
                {WORDS.map((w) => (
                  <div key={w.key} className="flex flex-col gap-1">
                    <h4 className="text-xs tracking-wide text-(--color-dim) uppercase">
                      {w.label}
                    </h4>
                    <p className="text-sm whitespace-pre-wrap text-(--color-body)">
                      {payload[w.key]?.trim() ? payload[w.key] : "—"}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm text-(--color-ink)">
          Comments ({comments.length})
          {deletedCommentCount > 0 ? (
            <span className="text-(--color-dim)">
              {" "}
              · {deletedCommentCount} deleted by the reviewer
            </span>
          ) : null}
        </h2>

        {comments.length === 0 ? (
          <p className="text-sm text-(--color-dim)">No comments yet.</p>
        ) : (
          byPath(comments).map(([path, list]) => {
            const href = siteHref(round.siteUrl, path);
            return (
              <div key={path} className="flex flex-col gap-2">
                <h3 className="font-(family-name:--font-mono) text-xs text-(--color-body)">
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      {path}
                    </a>
                  ) : (
                    path
                  )}{" "}
                  <span className="text-(--color-dim)">({list.length})</span>
                </h3>
                <ul className="flex flex-col gap-2">
                  {list.map((comment) => (
                    <li
                      key={comment.id}
                      className="flex flex-col gap-1 border-l-2 border-(--color-line-soft) pl-3"
                    >
                      <p className="text-sm whitespace-pre-wrap text-(--color-ink)">
                        {comment.body}
                      </p>
                      <p className="text-xs text-(--color-dim)">
                        {comment.target.label ?? comment.target.selector} ·{" "}
                        {comment.viewport.width}×{comment.viewport.height} ·{" "}
                        {WHEN.format(new Date(comment.createdAt))}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
