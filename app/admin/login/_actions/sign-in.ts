"use server";

import { redirect } from "next/navigation";
import { adminRoutes } from "@/lib/routes";
import { signInAdmin } from "@/server/services/admin-auth";

/**
 * The login form's action. Thin by law: validate, call the service, return.
 *
 * The returned shape is what `useActionState` renders, so a failed attempt
 * comes back as a message rather than an exception — a mistyped password is an
 * expected outcome of a login screen, not an error page.
 */
export type SignInState = { message: string | null };

export async function signInAction(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { message: "Enter your email and password." };
  }

  const result = await signInAdmin(email, password);
  if (!result.ok) return { message: result.message };

  redirect(adminRoutes.home);
}
