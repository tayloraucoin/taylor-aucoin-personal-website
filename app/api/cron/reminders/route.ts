import type { NextRequest } from "next/server";
import { requireEnv } from "@/lib/env";
import { sweepReminders } from "@/server/services/emails";

/**
 * The daily reminder sweep, run by Vercel Cron.
 *
 * Guarded by a shared secret because it is a public URL that sends email. It
 * is safe to run more than once a day — every send is claimed in the database
 * before it goes out — but nothing should be able to trigger it at will.
 *
 * The response counts what happened and names nothing: no addresses, no
 * business names, no tokens.
 */
export async function GET(request: NextRequest) {
  const provided = request.headers.get("authorization");

  if (provided !== `Bearer ${requireEnv("CRON_SECRET")}`) {
    return new Response(null, { status: 401 });
  }

  const result = await sweepReminders();

  console.info(
    `[intake] reminder sweep: ${result.sent} sent of ${result.considered} considered, ${result.skippedNoLink} skipped without a link`,
  );

  return Response.json(result);
}
