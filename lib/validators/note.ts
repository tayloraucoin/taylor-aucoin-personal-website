import { z } from "zod";
import { BUDGETS, ROLES, STARTS } from "./book";

/**
 * A note from `/contact` or `/book`'s not-a-fit view (data-contract.md's
 * Note). The client checks with it before posting and the server checks
 * every submit again: one schema, so the two can never disagree.
 *
 * The caps are the abuse controls' field caps (D-SITE-224): an address is
 * at most 254 characters by RFC 5321, and the rest bound what one note can
 * put in Taylor's inbox.
 */
export const NOTE_LIMITS = { message: 5000, name: 100, email: 254 } as const;

export const NOTE_FROM = ["contact", "not_a_fit"] as const;
export type NoteFrom = (typeof NOTE_FROM)[number];

/**
 * The screening answers a not-a-fit note carries unseen: `/book`'s own keys,
 * so a forged answer is refused rather than mailed.
 */
const screeningSchema = z.object({
  budget: z.enum(BUDGETS),
  start: z.enum(STARTS),
  role: z.enum(ROLES),
});
export type NoteScreening = z.output<typeof screeningSchema>;

export const noteSchema = z.object({
  message: z.string().trim().min(1).max(NOTE_LIMITS.message),
  name: z
    .string()
    .trim()
    .max(NOTE_LIMITS.name)
    .optional()
    .transform((name) => name || undefined),
  email: z.string().trim().max(NOTE_LIMITS.email).pipe(z.email()),
  from: z.enum(NOTE_FROM),
  screening: screeningSchema.optional(),
});

export type Note = z.output<typeof noteSchema>;
export type NoteInput = z.input<typeof noteSchema>;

/** The fields a visitor types, in the order focus should reach them. */
export const NOTE_FIELDS = ["message", "name", "email"] as const;
export type NoteField = (typeof NOTE_FIELDS)[number];

export type NoteFieldErrors = Partial<Record<NoteField, true>>;

/**
 * Which typed fields failed, and nothing else: the reason is a field's own
 * error line, and no value ever comes back in the result.
 */
export function noteFieldErrors(error: z.ZodError): NoteFieldErrors {
  const out: NoteFieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (NOTE_FIELDS.includes(field as NoteField))
      out[field as NoteField] = true;
  }
  return out;
}
