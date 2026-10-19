import { z } from "zod";

/** An address is at most 254 characters by RFC 5321 (data-contract.md). */
export const NOTE_SIGNUP_MAX = 254;

/**
 * The notes signup (data-contract.md's Signup): one address, trimmed and
 * lower-cased so a listed address in another case is the same row. The
 * client checks with it before posting and the server checks every submit
 * again. An address with no ending (`name@company`) fails.
 */
export const noteSignupSchema = z.object({
  email: z.string().trim().toLowerCase().max(NOTE_SIGNUP_MAX).pipe(z.email()),
});

export type NoteSignup = z.output<typeof noteSignupSchema>;
