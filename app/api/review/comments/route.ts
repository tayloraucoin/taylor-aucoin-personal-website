import type { NextRequest } from "next/server";
import { reviewCommentInput } from "@/lib/validators/review";
import {
  listReviewComments,
  recordReviewComment,
  resolveRoundFromRequest,
} from "@/server/services/review";
import {
  badRequest,
  methodNotAllowed,
  readJsonBody,
  serverError,
  unauthorized,
} from "../_lib/http";

export const dynamic = "force-dynamic";

/**
 * Lists a round's live comments, optionally for one page (`?path=`).
 *
 * The path is passed through as given: a page the round has no comments on
 * is an empty list, not an error, and nothing here knows what pages the
 * client site has.
 */
export async function GET(request: NextRequest) {
  try {
    const round = await resolveRoundFromRequest(request);
    if (!round) return unauthorized();

    const path = request.nextUrl.searchParams.get("path") ?? undefined;
    const comments = await listReviewComments(round.id, path);

    return Response.json({ ok: true, comments });
  } catch (error) {
    console.error(
      "[review] comment list failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return serverError();
  }
}

/**
 * Files one comment. Idempotent on its id (M-REV-2): a retry returns the
 * same `{ ok: true }` and writes nothing.
 *
 * Order of checks is the contract's: the key is resolved before the body is
 * read, so an unauthenticated caller learns nothing about what a valid body
 * looks like.
 */
export async function POST(request: NextRequest) {
  try {
    const round = await resolveRoundFromRequest(request);
    if (!round) return unauthorized();

    const body = await readJsonBody(request);
    if (body === null) return badRequest();

    const parsed = reviewCommentInput.safeParse(body);
    if (!parsed.success) return badRequest();

    await recordReviewComment(round.id, parsed.data);

    return Response.json({ ok: true });
  } catch (error) {
    console.error(
      "[review] comment record failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return serverError();
  }
}

export {
  methodNotAllowed as DELETE,
  methodNotAllowed as PATCH,
  methodNotAllowed as PUT,
};
