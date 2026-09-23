import { z } from "zod";
import type {
  ReviewAnswer,
  ReviewAnswers,
  ReviewComment,
  ReviewCommentTarget,
  ReviewSubmission,
} from "@/lib/types/review";

/**
 * The review-ingest bodies, validated on the way in.
 *
 * These mirror `lib/validators/review.ts` in the client boilerplate field for
 * field — the contract (`docs/review/REVIEW-BACKEND-CONTRACT.md` §4) says the
 * two must agree, and the `satisfies` clauses below hold this side to the
 * contract's TypeScript shapes so a drift here is a compile error, not a 400
 * the client site discovers in production.
 *
 * Nothing is coerced. The caller is another site's server, not a form, and a
 * number arriving as a string is a bug on that side that should be visible.
 */
export const reviewCommentTargetInput = z.object({
  selector: z.string().min(1).max(1024),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  label: z.string().max(200).optional(),
}) satisfies z.ZodType<ReviewCommentTarget>;

export const reviewCommentInput = z.object({
  id: z.uuid(),
  path: z.string().max(512).startsWith("/"),
  body: z.string().trim().min(1).max(4000),
  target: reviewCommentTargetInput,
  viewport: z.object({
    width: z.number().int().min(0),
    height: z.number().int().min(0),
  }),
  // `offset: true` accepts both the `Z` form `Date#toISOString` produces and
  // an explicit offset; the contract says ISO 8601 and means either.
  createdAt: z.iso.datetime({ offset: true }),
}) satisfies z.ZodType<ReviewComment>;

export type ReviewCommentInput = z.infer<typeof reviewCommentInput>;

const nullableText = (max: number) => z.string().max(max).nullable();

/**
 * The structured answers (REV-2, M-REV-5). Shape and bounds only: this side
 * cannot know a client's questions, so it checks that every item reads on
 * its own, not that it is the right item.
 */
const answerOption = z.object({
  id: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
});

const answerBase = {
  id: z
    .string()
    .max(64)
    .regex(/^[a-z0-9][a-z0-9.-]*$/),
  section: z.string().min(1).max(100),
  label: z.string().min(1).max(300),
};

/** 0.0–7.0 in tenths, the intake's scale. Float-tolerant: 0.7 * 10 is not 7. */
const scaleValue = z
  .number()
  .min(0)
  .max(7)
  .refine((n) => Math.abs(n * 10 - Math.round(n * 10)) < 1e-9, {
    message: "One decimal place at most",
  });

export const reviewAnswerInput = z.discriminatedUnion("kind", [
  z.object({
    ...answerBase,
    kind: z.literal("rank"),
    value: z
      .array(answerOption)
      .min(1)
      .max(20)
      .refine((o) => new Set(o.map((x) => x.id)).size === o.length, {
        message: "An option is ranked twice",
      }),
  }),
  z.object({
    ...answerBase,
    kind: z.literal("scale"),
    value: scaleValue,
    ends: z.object({
      low: z.string().min(1).max(100),
      high: z.string().min(1).max(100),
    }),
    baseline: scaleValue.nullable(),
  }),
  z.object({
    ...answerBase,
    kind: z.literal("choice"),
    value: answerOption,
  }),
  z.object({
    ...answerBase,
    kind: z.literal("text"),
    value: z.string().trim().min(1).max(5000),
  }),
]) satisfies z.ZodType<ReviewAnswer>;

export const reviewAnswersInput = z.object({
  schema: z.string().min(1).max(64),
  items: z
    .array(reviewAnswerInput)
    .max(80)
    .refine((items) => new Set(items.map((i) => i.id)).size === items.length, {
      message: "A question is answered twice",
    }),
}) satisfies z.ZodType<ReviewAnswers>;

export const reviewSubmissionInput = z.object({
  id: z.uuid(),
  preferredKit: nullableText(100),
  preferredLayout: nullableText(100),
  preferredMock: nullableText(100),
  flinch: nullableText(5000),
  fightFor: nullableText(5000),
  notes: nullableText(5000),
  commentCount: z.number().int().min(0),
  submittedAt: z.iso.datetime({ offset: true }),
  answers: reviewAnswersInput.nullable().optional(),
}) satisfies z.ZodType<ReviewSubmission>;

export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionInput>;

/**
 * Who a sister repo says it is (M-REV-6), read from its request headers:
 * `X-Review-Client-App` (the static slug), `X-Review-Engagement` (the
 * production engagement id, optional) and `X-Review-Label` (URI-encoded).
 */
export const reviewCallerInput = z.object({
  clientApp: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9][a-z0-9-]*$/),
  engagementId: z.uuid().optional(),
  label: z.string().trim().min(1).max(200),
});

export type ReviewCallerInput = z.infer<typeof reviewCallerInput>;
