import "server-only";
import { looksLikeBot } from "@/components/forms/bot-check";
import {
  bookFieldErrors,
  bookSchema,
  firstNameOf,
} from "@/lib/validators/book";
import { fit } from "./fit";
import type { ScreeningState } from "./state";

function text(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === "string" ? value : undefined;
}

/** The form's fields as the schema reads them. */
export function readBookForm(formData: FormData) {
  return {
    building: text(formData, "building") ?? "",
    budget: text(formData, "budget"),
    start: text(formData, "start"),
    role: text(formData, "role"),
    name: text(formData, "name"),
    email: text(formData, "email") ?? "",
  };
}

/**
 * The screening's whole rule: the bot rules first (a bot is told to write
 * first and nothing is recorded), then the server's own validation, then
 * the fit rule. Nothing is stored and nothing is logged.
 */
export function screen(formData: FormData): ScreeningState {
  if (looksLikeBot(formData))
    return { status: "outcome", outcome: "not_a_fit" };

  const parsed = bookSchema.safeParse(readBookForm(formData));
  if (!parsed.success) {
    return { status: "invalid", fields: bookFieldErrors(parsed.error) };
  }

  return {
    status: "outcome",
    outcome: fit(parsed.data),
    firstName: firstNameOf(parsed.data.name),
    answers: parsed.data,
  };
}
