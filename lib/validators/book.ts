import { z } from "zod";

/**
 * The screening at `/book` (data-contract.md's form contract). Client and
 * server share it: the client checks before posting and the server checks
 * every submit again. Option keys are code; their labels are copy, in
 * `content/book.ts`.
 */
export const BUDGETS = [
  "under-15k",
  "15k-75k",
  "over-75k",
  "salary",
  "none",
] as const;
export const STARTS = [
  "this-month",
  "1-3-months",
  "later",
  "exploring",
] as const;
export const ROLES = [
  "product-engineer",
  "product-designer",
  "systems-consultant",
  "fractional-cto",
  "zero-to-one",
  "website-or-brand",
  "not-sure",
] as const;

export type Budget = (typeof BUDGETS)[number];
export type Start = (typeof STARTS)[number];
export type Role = (typeof ROLES)[number];

export const BOOK_LIMITS = { building: 2000, name: 100, email: 254 } as const;

export const bookSchema = z.object({
  building: z.string().trim().min(1).max(BOOK_LIMITS.building),
  budget: z.enum(BUDGETS),
  start: z.enum(STARTS),
  role: z.enum(ROLES),
  name: z
    .string()
    .trim()
    .max(BOOK_LIMITS.name)
    .optional()
    .transform((name) => name || undefined),
  email: z.string().trim().max(BOOK_LIMITS.email).pipe(z.email()),
});

export type BookInput = z.output<typeof bookSchema>;

/** What the server decides (D-SITE-166); the client never computes it. */
export type Outcome = "fit" | "not_a_fit" | "website";

/** The fields in the order they are drawn, which is the order focus takes. */
export const BOOK_FIELDS = [
  "building",
  "budget",
  "start",
  "role",
  "name",
  "email",
] as const;
export type BookField = (typeof BOOK_FIELDS)[number];
export type BookFieldErrors = Partial<Record<BookField, true>>;

/** Which fields failed, and nothing else: no value comes back. */
export function bookFieldErrors(error: z.ZodError): BookFieldErrors {
  const out: BookFieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (BOOK_FIELDS.includes(field as BookField))
      out[field as BookField] = true;
  }
  return out;
}

/** The greeting's name: the first word of Name, or nothing (D-SITE-201). */
export function firstNameOf(name: string | undefined): string | undefined {
  return name?.trim().split(/\s+/)[0] || undefined;
}
