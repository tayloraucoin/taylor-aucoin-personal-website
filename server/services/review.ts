import { createHash, timingSafeEqual } from "node:crypto";
import { and, asc, count, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  engagements,
  reviewComments,
  reviewRounds,
  reviewSubmissions,
  type ReviewCommentRow,
  type ReviewRoundRow,
} from "@/db/schema";
import { readEnv } from "@/lib/env";
import { groupReviewAnswers, scaleChange, tenths } from "@/lib/review/answers";
import type {
  ReviewAnswer,
  ReviewAnswers,
  ReviewComment,
  ReviewSubmission,
} from "@/lib/types/review";
import {
  reviewCallerInput,
  type ReviewCallerInput,
  type ReviewCommentInput,
  type ReviewSubmissionInput,
} from "@/lib/validators/review";
import { notifyOps } from "./emails";

/**
 * What a route handler or an admin page is allowed to hold. An allowlist,
 * like `Engagement`.
 */
export type ReviewRound = Pick<
  ReviewRoundRow,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "clientApp"
  | "clientName"
  | "engagementId"
  | "label"
  | "siteUrl"
  | "submittedAt"
>;

function toReviewRound(row: ReviewRoundRow): ReviewRound {
  return {
    id: row.id,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    clientApp: row.clientApp,
    clientName: row.clientName,
    engagementId: row.engagementId,
    label: row.label,
    siteUrl: row.siteUrl,
    submittedAt: row.submittedAt,
  };
}

/** The wire shape (contract §4), from the row. */
function toReviewComment(row: ReviewCommentRow): ReviewComment {
  return {
    id: row.id,
    path: row.path,
    body: row.body,
    target: row.target,
    viewport: { width: row.viewportWidth, height: row.viewportHeight },
    createdAt: row.clientCreatedAt.toISOString(),
  };
}

/**
 * True when the bearer key is the shared `REVIEW_INGEST_KEY` (M-REV-6).
 *
 * Compared as sha-256 digests with `timingSafeEqual`, so the comparison
 * takes the same time whatever the input and the lengths always match.
 * An unset key refuses everything: failing closed is the only safe default
 * for an endpoint that writes and sends email.
 */
function isSisterRepoKey(key: string): boolean {
  const expected = readEnv("REVIEW_INGEST_KEY");
  if (!expected) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(key), digest(expected));
}

/** The caller's identity headers, decoded; null when they do not validate. */
function readCaller(request: Request): ReviewCallerInput | null {
  let label = "";
  try {
    label = decodeURIComponent(request.headers.get("x-review-label") ?? "");
  } catch {
    return null;
  }
  const parsed = reviewCallerInput.safeParse({
    clientApp: request.headers.get("x-review-client-app") ?? "",
    engagementId: request.headers.get("x-review-engagement") || undefined,
    label,
  });
  return parsed.success ? parsed.data : null;
}

/**
 * The round for a sister repo, created on first contact (M-REV-6).
 *
 * The engagement link is soft: when the id the repo sends exists in this
 * database (production) the round is linked and named after its business;
 * when it does not (staging, a laptop) the round is still created, unlinked,
 * and named after the `clientApp`. Nothing about an existing round is
 * rewritten by a later request.
 */
async function findOrCreateRound(
  caller: ReviewCallerInput,
): Promise<ReviewRound> {
  const db = getDb();
  const find = async () => {
    const [row] = await db
      .select()
      .from(reviewRounds)
      .where(eq(reviewRounds.clientApp, caller.clientApp))
      .limit(1);
    return row;
  };

  const existing = await find();
  if (existing) return toReviewRound(existing);

  const [engagement] = caller.engagementId
    ? await db
        .select({ id: engagements.id, businessName: engagements.businessName })
        .from(engagements)
        .where(eq(engagements.id, caller.engagementId))
        .limit(1)
    : [];

  await db
    .insert(reviewRounds)
    .values({
      clientApp: caller.clientApp,
      clientName: engagement?.businessName ?? caller.clientApp,
      engagementId: engagement?.id ?? null,
      label: caller.label,
    })
    .onConflictDoNothing({ target: reviewRounds.clientApp });

  // A concurrent first request may have inserted it; either way it exists.
  const created = await find();
  if (!created) throw new Error("Review round insert returned no row.");
  if (!engagement && caller.engagementId) {
    console.info(
      `[review] round for ${caller.clientApp} created unlinked; engagement not in this database`,
    );
  }
  return toReviewRound(created);
}

/**
 * The only path from a request to a round: the shared key proves the caller
 * is one of Taylor's repos, the identity headers say which (M-REV-6,
 * superseding M-REV-1). Null covers every failure the contract folds into a
 * 401: no key, the wrong key, or missing or malformed identity headers. A
 * database error is not one of those and still throws.
 */
export async function resolveRoundFromRequest(
  request: Request,
): Promise<ReviewRound | null> {
  const header = request.headers.get("authorization");
  const key = header?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!key || !isSisterRepoKey(key)) return null;

  const caller = readCaller(request);
  if (!caller) return null;

  return findOrCreateRound(caller);
}

/** A round as the admin list shows it (REV-3). */
export type ReviewRoundSummary = ReviewRound & {
  liveCommentCount: number;
  submissionCount: number;
};

/**
 * Every round with its live-comment and submission counts, newest first,
 * for the admin list (REV-3). Read by an admin page behind `requireAdmin`;
 * the key hash never leaves `toReviewRound`.
 */
export async function loadReviewRoundSummaries(): Promise<
  ReviewRoundSummary[]
> {
  const db = getDb();
  const [rounds, comments, submissions] = await Promise.all([
    db.select().from(reviewRounds).orderBy(desc(reviewRounds.createdAt)),
    db
      .select({ roundId: reviewComments.roundId, n: count() })
      .from(reviewComments)
      .where(isNull(reviewComments.deletedAt))
      .groupBy(reviewComments.roundId),
    db
      .select({ roundId: reviewSubmissions.roundId, n: count() })
      .from(reviewSubmissions)
      .groupBy(reviewSubmissions.roundId),
  ]);

  const commentsBy = new Map(comments.map((c) => [c.roundId, c.n]));
  const submissionsBy = new Map(submissions.map((c) => [c.roundId, c.n]));

  return rounds.map((row) => ({
    ...toReviewRound(row),
    liveCommentCount: commentsBy.get(row.id) ?? 0,
    submissionCount: submissionsBy.get(row.id) ?? 0,
  }));
}

/** One submission as stored: our receipt time and the client's whole body. */
export type ReviewSubmissionRecord = {
  id: string;
  receivedAt: Date;
  payload: ReviewSubmission;
};

export type ReviewRoundDetail = {
  round: ReviewRound;
  /** Oldest first; a re-send after revising is a later entry. */
  submissions: ReviewSubmissionRecord[];
  /** Live comments, oldest first by the reviewer's clock. */
  comments: ReviewComment[];
  deletedCommentCount: number;
};

/**
 * Everything a round received, for the admin detail page (REV-3). Null for
 * an unknown id; the caller validates the id's shape first.
 */
export async function loadReviewRoundDetail(
  roundId: string,
): Promise<ReviewRoundDetail | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(reviewRounds)
    .where(eq(reviewRounds.id, roundId))
    .limit(1);
  if (!row) return null;

  const [submissions, comments, [deleted]] = await Promise.all([
    db
      .select()
      .from(reviewSubmissions)
      .where(eq(reviewSubmissions.roundId, roundId))
      .orderBy(asc(reviewSubmissions.createdAt)),
    listReviewComments(roundId),
    db
      .select({ n: count() })
      .from(reviewComments)
      .where(
        and(
          eq(reviewComments.roundId, roundId),
          isNotNull(reviewComments.deletedAt),
        ),
      ),
  ]);

  return {
    round: toReviewRound(row),
    submissions: submissions.map((s) => ({
      id: s.id,
      receivedAt: s.createdAt,
      payload: s.payload,
    })),
    comments,
    deletedCommentCount: deleted?.n ?? 0,
  };
}

/**
 * Live comments in a round, oldest first, optionally on one page.
 *
 * Ordered by the reviewer's clock, not ours: a comment that was retried an
 * hour after it was written still belongs where it was written.
 */
export async function listReviewComments(
  roundId: string,
  path?: string,
): Promise<ReviewComment[]> {
  const rows = await getDb()
    .select()
    .from(reviewComments)
    .where(
      and(
        eq(reviewComments.roundId, roundId),
        isNull(reviewComments.deletedAt),
        path === undefined ? undefined : eq(reviewComments.path, path),
      ),
    )
    .orderBy(asc(reviewComments.clientCreatedAt));

  return rows.map(toReviewComment);
}

/**
 * Files a comment. Idempotent on its id (M-REV-2): a retry after a lost
 * response inserts nothing and reports `created: false`.
 */
export async function recordReviewComment(
  roundId: string,
  input: ReviewCommentInput,
): Promise<{ created: boolean }> {
  const [inserted] = await getDb()
    .insert(reviewComments)
    .values({
      id: input.id,
      body: input.body,
      clientCreatedAt: new Date(input.createdAt),
      path: input.path,
      target: input.target,
      viewportHeight: input.viewport.height,
      viewportWidth: input.viewport.width,
      roundId,
    })
    .onConflictDoNothing({ target: reviewComments.id })
    .returning({ id: reviewComments.id });

  return { created: inserted !== undefined };
}

/**
 * Soft-deletes a comment, scoped to the caller's round so one round's key
 * cannot touch another's comments. Idempotent: an unknown or already-deleted
 * id is a no-op, which is what a retry after a lost response needs.
 */
export async function deleteReviewComment(
  roundId: string,
  id: string,
): Promise<{ deleted: boolean }> {
  const [updated] = await getDb()
    .update(reviewComments)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(reviewComments.id, id),
        eq(reviewComments.roundId, roundId),
        isNull(reviewComments.deletedAt),
      ),
    )
    .returning({ id: reviewComments.id });

  return { deleted: updated !== undefined };
}

/**
 * Files the round's submission.
 *
 * Idempotent on its id (M-REV-2), and that is what makes the side effects
 * safe: only the insert that actually lands stamps the round's
 * `submitted_at` (once — `coalesce` keeps an earlier stamp) and emails
 * Taylor. A retry is a no-op end to end, so a lost response cannot become a
 * second email (M-REV-4).
 *
 * The three free-text answers and the structured answers (REV-2) go into
 * the email verbatim — it is Taylor's own inbox, and reading them is the
 * point. They never go anywhere near a log line.
 */
export async function recordReviewSubmission(
  roundId: string,
  input: ReviewSubmissionInput,
): Promise<{ created: boolean }> {
  const db = getDb();

  const [inserted] = await db
    .insert(reviewSubmissions)
    .values({ id: input.id, payload: input, roundId })
    .onConflictDoNothing({ target: reviewSubmissions.id })
    .returning({ id: reviewSubmissions.id });

  if (!inserted) {
    console.info(
      `[review] submission ${input.id} already recorded for round ${roundId}`,
    );
    return { created: false };
  }

  const [round] = await db
    .update(reviewRounds)
    .set({
      // `now()` from Postgres rather than a JavaScript date, for the same
      // reason `markStepReached` does it: a raw `sql` template carries no
      // column type for Drizzle to map a Date through.
      submittedAt: sql`coalesce(${reviewRounds.submittedAt}, now())`,
      updatedAt: new Date(),
    })
    .where(eq(reviewRounds.id, roundId))
    .returning();

  console.info(
    `[review] submission ${input.id} recorded for round ${roundId} with ${input.commentCount} comments`,
  );

  if (!round) return { created: true };

  const sent = await notifyOps(`Review round submitted · ${round.clientName}`, [
    `Round:            ${round.label}`,
    `Client:           ${round.clientName}`,
    `Round id:         ${round.id}`,
    ``,
    `Preferred kit:    ${input.preferredKit ?? "—"}`,
    `Preferred layout: ${input.preferredLayout ?? "—"}`,
    `Preferred mock:   ${input.preferredMock ?? "—"}`,
    `Comments left:    ${input.commentCount}`,
    ``,
    `What made them flinch:`,
    input.flinch?.trim() ? input.flinch : `(nothing written)`,
    ``,
    `What they'd fight for:`,
    input.fightFor?.trim() ? input.fightFor : `(nothing written)`,
    ``,
    `Notes:`,
    input.notes?.trim() ? input.notes : `(nothing written)`,
    ``,
    ...formatReviewAnswers(input.answers),
  ]);

  if (!sent) {
    // The row is filed either way; the email is a courtesy, not the record.
    console.error(
      `[review] submission email not sent for round ${roundId}; read the review_submissions row`,
    );
  }

  return { created: true };
}

/**
 * The structured answers as plain-text email lines (REV-2, M-REV-5): in the
 * order the form asked them, a heading per section, every item printed from
 * its own label snapshot and each note under the answer it belongs to. A
 * scale prints its intake baseline and the change beside the new value,
 * which is the comparison the re-asked sliders exist for. Exported so the
 * email body can be checked without a send.
 */
export function formatReviewAnswers(
  answers: ReviewAnswers | null | undefined,
): string[] {
  if (!answers || answers.items.length === 0) {
    return [`Structured answers: none sent`];
  }

  const lines = [
    `Structured answers (${answers.schema}, ${answers.items.length} items):`,
  ];

  for (const section of groupReviewAnswers(answers)) {
    lines.push(``, `── ${section.title} ──`);
    for (const { label, answer, note } of section.entries) {
      lines.push(label);
      if (answer) lines.push(...formatAnswerValue(answer));
      if (note) lines.push(`  In their words: ${note}`);
    }
  }

  return lines;
}

function formatAnswerValue(answer: ReviewAnswer): string[] {
  switch (answer.kind) {
    case "rank":
      return answer.value.map((option, i) => `  ${i + 1}. ${option.label}`);
    case "scale": {
      const range = `${answer.ends.low} 0 ↔ 7 ${answer.ends.high}`;
      if (answer.baseline === null) {
        return [`  ${tenths(answer.value)}   (${range})`];
      }
      return [
        `  ${tenths(answer.value)} now · ${tenths(answer.baseline)} at intake · ${scaleChange(answer.value, answer.baseline)}   (${range})`,
      ];
    }
    case "choice":
      return [`  ${answer.value.label}`];
    case "text":
      return [`  ${answer.value}`];
  }
}
