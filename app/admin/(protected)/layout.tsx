import { AdminShell } from "@/app/admin/_components/admin-shell";
import { requireAdmin } from "@/server/services/admin-auth";
import { signOutAction } from "./_actions/sign-out";

/**
 * Reads cookies to establish the session, so nothing under here may be
 * statically rendered.
 */
export const dynamic = "force-dynamic";

/**
 * The gate for every authenticated admin surface.
 *
 * This guard protects rendering. It is **not** the only guard: each server
 * action calls `requireAdmin` itself, because a POST aimed straight at an
 * action never renders a layout (M-CRM-1). Adding a page under this folder
 * does not exempt its actions from checking.
 */
export default async function AdminProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin();

  return (
    <AdminShell email={admin.email} signOut={signOutAction}>
      {children}
    </AdminShell>
  );
}
