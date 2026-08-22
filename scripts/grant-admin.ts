import { parseArgs } from "node:util";
import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";
import { ADMIN_ROLES, type AdminRole } from "@/server/services/admin-auth";
import { applyTierEnv, currentTier } from "./_env";

applyTierEnv();

/**
 * Grants or revokes admin access.
 *
 *   yarn admin:grant taylor@example.com
 *   yarn admin:grant taylor@example.com --role super_admin
 *   yarn admin:grant taylor@example.com --revoke
 *
 * The role lives in the user's Supabase `app_metadata`, which only the
 * service-role key may write — a signed-in user cannot promote themselves the
 * way they could with `user_metadata`. That key exists here and nowhere near a
 * request path.
 *
 * This is also the lockout recovery: with no env allowlist any more, a user
 * whose role is removed gets back in through this script, run from a machine
 * that holds the service-role key.
 *
 * Grants are merged into existing metadata rather than replacing it, so
 * anything Supabase or a future feature keeps there survives.
 */
async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      role: { type: "string" },
      revoke: { type: "boolean" },
    },
  });

  const email = positionals[0]?.trim().toLowerCase();

  if (!email) {
    console.error(
      "\nUsage: yarn admin:grant <email> [--role admin|super_admin] [--revoke]\n",
    );
    process.exit(1);
  }

  const role = (values.role ?? "admin") as AdminRole;

  if (!values.revoke && !ADMIN_ROLES.includes(role)) {
    console.error(
      `\nUnknown role "${role}". Use one of: ${ADMIN_ROLES.join(", ")}\n`,
    );
    process.exit(1);
  }

  const supabase = createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // There is no get-user-by-email in the admin API, so the list is paged
  // through. Small here, and it stays honest if it ever is not.
  let user: { id: string; email?: string; app_metadata: Record<string, unknown> } | undefined;

  for (let page = 1; page <= 20 && !user; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      console.error(`\nCould not list users: ${error.message}\n`);
      process.exit(1);
    }

    if (data.users.length === 0) break;
    user = data.users.find((u) => u.email?.toLowerCase() === email);
  }

  if (!user) {
    console.error(
      `\nNo Supabase user with that email on tier "${currentTier()}".` +
        `\nCreate them in the Supabase dashboard first (Authentication -> Users).\n`,
    );
    process.exit(1);
  }

  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...user.app_metadata,
      // Undefined removes the key rather than storing a null that `readRole`
      // would have to know about.
      role: values.revoke ? undefined : role,
    },
  });

  if (error) {
    console.error(`\nCould not update that user: ${error.message}\n`);
    process.exit(1);
  }

  console.log(
    values.revoke
      ? `\nRevoked admin from ${email} on tier "${currentTier()}".`
      : `\nGranted "${role}" to ${email} on tier "${currentTier()}".`,
  );
  console.log("They need to sign out and back in for it to take effect.\n");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
