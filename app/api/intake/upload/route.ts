import type { NextRequest } from "next/server";
import { uploadIssueInput } from "@/lib/validators/intake";
import { EngagementNotFoundError } from "@/server/services/engagement";
import {
  UploadTooLargeError,
  confirmUpload,
  issueUploadTicket,
} from "@/server/services/submission";

/**
 * Issues a one-shot upload URL, and confirms delivery afterwards.
 *
 * A route handler rather than a server action because the client needs a plain
 * JSON reply it can act on per file — a queue of fifteen photos wants
 * per-file success and failure, not a page transition.
 *
 * The token is the only credential and it is checked before anything is
 * signed, so a URL is never minted for a link that does not resolve. Errors
 * carry no detail about which of those two things went wrong.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  // Confirmation is the same endpoint with a different shape: one round trip
  // per file either way, and one place where the token is resolved.
  if (
    typeof body === "object" &&
    body !== null &&
    "confirm" in body &&
    typeof (body as { confirm?: unknown }).confirm === "string" &&
    "token" in body &&
    typeof (body as { token?: unknown }).token === "string"
  ) {
    const { token, confirm } = body as { token: string; confirm: string };

    try {
      await confirmUpload(token, confirm);
      return Response.json({ ok: true });
    } catch (error) {
      if (error instanceof EngagementNotFoundError) {
        return Response.json({ error: "link" }, { status: 404 });
      }
      throw error;
    }
  }

  const parsed = uploadIssueInput.safeParse(body);

  if (!parsed.success) {
    // A file over the ceiling fails here, at the schema. The surface turns
    // this into a gentle line rather than an error state.
    return Response.json({ error: "too_large_or_invalid" }, { status: 400 });
  }

  try {
    const ticket = await issueUploadTicket(parsed.data);
    return Response.json(ticket);
  } catch (error) {
    if (error instanceof EngagementNotFoundError) {
      return Response.json({ error: "link" }, { status: 404 });
    }
    if (error instanceof UploadTooLargeError) {
      return Response.json({ error: "too_large_or_invalid" }, { status: 400 });
    }

    console.error(
      "[intake] upload issuance failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return Response.json({ error: "server" }, { status: 500 });
  }
}
