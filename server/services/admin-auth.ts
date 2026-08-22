import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { requireEnv } from "@/lib/env";
import { adminRoutes } from "@/lib/routes";

/**
 * The one door into `/admin`.
 *
 * Two checks, and both are load-bearing. A valid Supabase session proves who
 * someone is; a `role` in their `app_metadata` decides whether that person may
 * be here. Authentication alone would mean any account the project ever issues
 * inherits the admin surface, which is how a signup form becomes a privilege
 * escalation.
 *
 * `app_metadata` is the right home for it: Supabase lets only the service-role
 * key write that object, so a signed-in user cannot promote themselves the way
 * they could with `user_metadata`. Grant it with `yarn admin:grant <email>`.
 *
 * `[REVISIT]` When roles need to carry more than a label — a second admin, an
 * invitation flow, per-capability grants, an audit trail of who changed what —
 * this moves to a `public.users` shadow table keyed to `auth.users(id)`. A JWT
 * claim is not a row and nothing can be joined to it. See
 * `docs/crm/TECH-SCOPE.md` §13.
 *
 * **Every admin page and every admin server action calls this**, not just the
 * layout. A layout guard protects rendering; it does nothing for a POST fired
 * straight at an action, which is the request an attacker would actually send
 * (M-CRM-1).
 *
 * No Supabase client is ever constructed in the browser. The anon key is read
 * through `lib/env.ts`, which throws if it is imported client-side, so the
 * posture that keeps the intake surface honest (M-INT-8) holds here too.
 */

/**
 * Who may be in `/admin`.
 *
 * A closed union rather than a string: adding a tier should break every switch
 * that has to care, and an unknown value from the wire must never widen into
 * access.
 */
export const ADMIN_ROLES = ["admin", "super_admin"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

/** The signed-in admin, narrowed to what surfaces are allowed to display. */
export type AdminUser = {
  id: string;
  email: string;
  role: AdminRole;
};

/**
 * Reads a role out of `app_metadata`, or null.
 *
 * `app_metadata` is typed as an open record by the Supabase SDK, so the value
 * is treated as unknown and narrowed against the union. Anything unrecognised —
 * absent, misspelled, or a role invented later and not deployed here — is not
 * an admin. Deny by default, at the one place the decision is made.
 */
function readRole(metadata: Record<string, unknown> | undefined): AdminRole | null {
  const value = metadata?.role;
  return typeof value === "string" &&
    (ADMIN_ROLES as readonly string[]).includes(value)
    ? (value as AdminRole)
    : null;
}

/**
 * A Supabase client bound to this request's cookies.
 *
 * `setAll` is a no-op when called from a Server Component, which cannot write
 * headers. That is expected rather than broken: session refresh happens in
 * middleware, which owns a mutable response. Swallowing the error here is what
 * lets the same helper serve pages and actions alike.
 */
async function createRequestClient() {
  const cookieStore = await cookies();

  return createServerClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Component render — middleware refreshes the session.
          }
        },
      },
    },
  );
}

/**
 * The current admin, or `null`.
 *
 * Use when a surface needs to branch on signed-in state — the login page, for
 * one, which redirects an already-authenticated admin onward instead of asking
 * them to sign in twice.
 */
export async function loadAdminUser(): Promise<AdminUser | null> {
  const supabase = await createRequestClient();

  // `getUser` revalidates against Supabase rather than trusting the cookie's
  // own claims, which is the difference between a session check and reading a
  // string the client could have written.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email?.trim().toLowerCase();
  if (!user || !email) return null;

  const role = readRole(user.app_metadata);
  return role ? { id: user.id, email, role } : null;
}

/**
 * The current admin, or a redirect to the login screen.
 *
 * `requireX` throws or diverts by the repo's verb taxonomy — callers get a
 * value or never return, so no caller can forget to handle the null case.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await loadAdminUser();
  if (!user) redirect(adminRoutes.login);
  return user;
}

/**
 * Ends the session.
 *
 * Signing out with a session that is already invalid is not an error worth
 * surfacing: the caller wanted to be signed out, and they are.
 */
export async function signOutAdmin(): Promise<void> {
  const supabase = await createRequestClient();
  await supabase.auth.signOut();
}

/**
 * Verifies a password against Supabase and, on success, sets the session
 * cookies.
 *
 * Returns a message rather than throwing on bad credentials, because a wrong
 * password is an expected outcome of a login form and not an exceptional one.
 * The message is deliberately identical for "no such user", "wrong password",
 * and "not on the allowlist" — distinguishing them would let anyone enumerate
 * which addresses have accounts.
 */
export async function signInAdmin(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const failure = {
    ok: false,
    message: "That email and password didn't match.",
  } as const;

  const supabase = await createRequestClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return failure;

  // Correct credentials for an account with no admin role are still a failure,
  // and deliberately the same failure: distinguishing them would let anyone
  // enumerate which addresses have accounts here.
  if (!readRole(data.user?.app_metadata)) {
    await supabase.auth.signOut();
    return failure;
  }

  return { ok: true };
}
