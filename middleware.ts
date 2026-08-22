import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { DEV_GEO_OVERRIDE } from "@/lib/config";
import { REGIME_COOKIE } from "@/lib/consent/constants";
import { resolveRegime } from "@/lib/consent/jurisdictions";
import { isDev, requireEnv } from "@/lib/env";
import { isAdminPath } from "@/lib/routes";

/**
 * Keeps the admin's Supabase session alive across requests.
 *
 * Refresh needs a mutable response, which a Server Component does not have —
 * so it happens here and only here. `getUser` is what actually performs the
 * refresh; discarding its result is intentional, because middleware is not the
 * authorization decision. `requireAdmin` is (M-CRM-1), and putting the check
 * in both places would invite someone to later trust the weaker one.
 *
 * The admin surface deliberately gets no consent cookie: nothing on it is
 * measured, so there is nothing for consent to gate (M-INT-10's reasoning,
 * applied here).
 */
async function refreshAdminSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  await supabase.auth.getUser();

  return response;
}

/**
 * Resolves the visitor's consent regime from edge geo and hands it to the
 * client as a cookie.
 *
 * Why a cookie and not `headers()` in the layout: reading request headers in a
 * server component opts every route into dynamic rendering, which would drop
 * static generation across the whole site and take PERF-01 (Lighthouse >= 95)
 * with it. Middleware runs at the edge, leaves the static HTML cacheable, and
 * the client reads the cookie after hydration. The banner is client-only
 * anyway, so nothing needs this at render time.
 */
export async function middleware(request: NextRequest) {
  // The admin tree gets session refresh and nothing else. Returning early is
  // what keeps the consent machinery off a surface that measures nothing.
  if (isAdminPath(request.nextUrl.pathname)) {
    return refreshAdminSession(request);
  }

  const response = NextResponse.next();

  // DEV_GEO_OVERRIDE is read only in dev, so a value left set in the file
  // cannot change what a real visitor gets.
  const spoof = isDev() ? DEV_GEO_OVERRIDE : null;

  const regime = resolveRegime(
    spoof ? spoof.country : request.headers.get("x-vercel-ip-country"),
    spoof ? spoof.region : request.headers.get("x-vercel-ip-country-region"),
  );

  if (request.cookies.get(REGIME_COOKIE)?.value !== regime) {
    response.cookies.set(REGIME_COOKIE, regime, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // A day. Travel happens; staleness should not.
      httpOnly: false, // The client gate has to read it.
    });
  }

  return response;
}

export const config = {
  // Document requests only. Static assets and the image optimizer neither
  // need the cookie nor should pay for an edge invocation.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|pdf|txt|xml|woff|woff2)$).*)",
  ],
};
