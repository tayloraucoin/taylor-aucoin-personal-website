import type { NextRequest } from "next/server";
import { resolveRoundFromRequest } from "@/server/services/review";
import { methodNotAllowed, serverError, unauthorized } from "../_lib/http";

export const dynamic = "force-dynamic";

/**
 * Proves a client site's key resolves, and tells its review index which
 * round it is talking to (contract §3).
 *
 * Nothing sensitive comes back: the label and client name are what the
 * client site already shows its reviewer, and `submittedAt` is what lets it
 * say "you've already sent this".
 */
export async function GET(request: NextRequest) {
  try {
    const round = await resolveRoundFromRequest(request);
    if (!round) return unauthorized();

    return Response.json({
      ok: true,
      round: {
        label: round.label,
        clientName: round.clientName,
        submittedAt: round.submittedAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error(
      "[review] health check failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return serverError();
  }
}

export {
  methodNotAllowed as DELETE,
  methodNotAllowed as PATCH,
  methodNotAllowed as POST,
  methodNotAllowed as PUT,
};
