import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  deleteReviewComment,
  resolveRoundFromRequest,
} from "@/server/services/review";
import {
  badRequest,
  methodNotAllowed,
  serverError,
  unauthorized,
} from "../../_lib/http";

export const dynamic = "force-dynamic";

const commentId = z.uuid();

/**
 * Soft-deletes one comment, scoped to the caller's round.
 *
 * An unknown id — or one already deleted, or one belonging to another round
 * — also answers `{ ok: true }` (contract §3): the client site retries a
 * delete after a lost response with the same id, and a retry that cannot
 * fail is the whole point. Only a malformed id is a 400.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const round = await resolveRoundFromRequest(request);
    if (!round) return unauthorized();

    const { id } = await params;
    const parsed = commentId.safeParse(id);
    if (!parsed.success) return badRequest();

    await deleteReviewComment(round.id, parsed.data);

    return Response.json({ ok: true });
  } catch (error) {
    console.error(
      "[review] comment delete failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return serverError();
  }
}

export {
  methodNotAllowed as GET,
  methodNotAllowed as PATCH,
  methodNotAllowed as POST,
  methodNotAllowed as PUT,
};
