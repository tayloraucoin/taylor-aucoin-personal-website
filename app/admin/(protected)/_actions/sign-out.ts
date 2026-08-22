"use server";

import { redirect } from "next/navigation";
import { adminRoutes } from "@/lib/routes";
import { signOutAdmin } from "@/server/services/admin-auth";

export async function signOutAction(): Promise<void> {
  await signOutAdmin();
  redirect(adminRoutes.login);
}
