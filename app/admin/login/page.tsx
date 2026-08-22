import { redirect } from "next/navigation";
import { LoginForm } from "@/app/admin/_components/login-form";
import { adminRoutes } from "@/lib/routes";
import { loadAdminUser } from "@/server/services/admin-auth";

/**
 * Reads cookies, so it must never be statically rendered — a cached login page
 * would show a signed-out shell to someone who is signed in.
 */
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  // An admin who is already signed in should not be asked again.
  if (await loadAdminUser()) redirect(adminRoutes.home);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-6 py-16">
      <h1 className="mb-1 font-(family-name:--font-display) text-2xl text-(--color-ink)">
        Admin
      </h1>
      <p className="mb-8 text-sm text-(--color-dim)">
        Lead pipeline and client engagements.
      </p>
      <LoginForm />
    </main>
  );
}
