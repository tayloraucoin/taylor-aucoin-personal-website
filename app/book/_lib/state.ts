import type {
  BookFieldErrors,
  BookInput,
  Outcome,
} from "@/lib/validators/book";

/**
 * What the screening action answers; the form renders each as a view on
 * the same URL. `answers` carries what the fit view posts on and what
 * not-a-fit prefills (SITE-23); a bot's outcome carries none.
 */
export type ScreeningState =
  | { status: "idle" }
  | { status: "invalid"; fields: BookFieldErrors }
  | {
      status: "outcome";
      outcome: Outcome;
      firstName?: string;
      answers?: BookInput;
    }
  | { status: "error" };
