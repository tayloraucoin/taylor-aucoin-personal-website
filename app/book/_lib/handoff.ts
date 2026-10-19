import "server-only";
import { siteRoutes } from "@/lib/routes";
import { bookSchema } from "@/lib/validators/book";
import { buildCalUrl } from "./cal-url";
import { fit } from "./fit";
import { readBookForm } from "./screen";

/**
 * Where a hand-off POST goes: Cal.com only when the server, re-reading the
 * answers itself, finds a fit; `/book`, with no query, for anything else
 * (invalid, tampered, not a fit, a website). The hidden fields are never
 * trusted for the outcome. Nothing is stored or logged.
 */
export function handoffTarget(formData: FormData, origin: string): URL {
  const parsed = bookSchema.safeParse(readBookForm(formData));
  if (parsed.success && fit(parsed.data) === "fit") {
    return buildCalUrl(parsed.data);
  }
  return new URL(siteRoutes.book, origin);
}
