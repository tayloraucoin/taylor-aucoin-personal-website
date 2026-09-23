import type { NextRequest } from "next/server";
import { reviewSubmissionInput } from "@/lib/validators/review";
import {
  recordReviewSubmission,
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
 * Files the round's submission. Idempotent on its id (M-REV-2).
 *
 * The side effects — stamping the round, emailing Taylor — belong to the
 * service and fire only on the insert that lands, so this handler has
 * nothing to decide beyond the contract's three replies.
 */
export async function POST(request: NextRequest) {
  try {
    const round = await resolveRoundFromRequest(request);
    if (!round) return unauthorized();

    const body = await readJsonBody(request);
    if (body === null) return badRequest();

    const parsed = reviewSubmissionInput.safeParse(body);
    if (!parsed.success) return badRequest();

    await recordReviewSubmission(round.id, parsed.data);

    return Response.json({ ok: true });
  } catch (error) {
    console.error(
      "[review] submission record failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return serverError();
  }
}

export {
  methodNotAllowed as DELETE,
  methodNotAllowed as GET,
  methodNotAllowed as PATCH,
  methodNotAllowed as PUT,
};
