import "server-only";
import { BOOKING_URL } from "@/lib/config";
import type { BookInput } from "@/lib/validators/book";

/**
 * The Cal.com hand-off for a confirmed fit (D-SITE-225): `BOOKING_URL`'s
 * origin and path, never anything from input, with Cal.com's booking-form
 * prefill as the only query: name (left out when blank), email, notes (the
 * "What are you building?" text), and the metadata SITE-M1 counts on.
 * Nothing else rides along: no budget, no start.
 */
export function buildCalUrl(input: BookInput): URL {
  const url = new URL(BOOKING_URL);
  url.search = "";
  url.hash = "";
  if (input.name) url.searchParams.set("name", input.name);
  url.searchParams.set("email", input.email);
  url.searchParams.set("notes", input.building);
  url.searchParams.set("metadata[source]", "site-screening");
  url.searchParams.set("metadata[role]", input.role);
  return url;
}
