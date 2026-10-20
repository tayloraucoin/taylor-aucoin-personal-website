import { NextResponse, type NextRequest } from "next/server";
import { handoffTarget } from "../_lib/handoff";

/**
 * POST /book/handoff (D-SITE-225): the fit view's call. Answers 303 to
 * Cal.com for a server-confirmed fit, else to `/book`. POST only: Next
 * answers any other method 405. The answers ride only in the body.
 */
export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    formData = new FormData();
  }
  const target = handoffTarget(formData, request.nextUrl.origin);
  const response = NextResponse.redirect(target, 303);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
