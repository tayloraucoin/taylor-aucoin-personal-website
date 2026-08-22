"use client";

import { useActionState } from "react";
import {
  signInAction,
  type SignInState,
} from "@/app/admin/login/_actions/sign-in";

const INITIAL: SignInState = { message: null };

/**
 * The one unauthenticated surface in the admin tree.
 *
 * Deliberately plain (D-CRM-16). The site's visual law governs what a client
 * sees; this is a working tool with one user, and ceremony here would be
 * decoration nobody is present to appreciate.
 *
 * The pending state disables the button rather than swapping the label out, so
 * the control never changes width mid-submit.
 */
export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, INITIAL);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm text-(--color-body)">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="username"
          required
          className="min-h-[44px] rounded-(--radius) border border-white/15 bg-black/30 px-3 text-base text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-(--color-body)">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className="min-h-[44px] rounded-(--radius) border border-white/15 bg-black/30 px-3 text-base text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
        />
      </label>

      {state.message ? (
        // Gold, not red: the intake surface's rule, kept here so one habit
        // covers the whole site.
        <p role="alert" className="text-sm text-(--color-c2)">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="min-h-[44px] rounded-(--radius) bg-(--color-c1) px-4 text-base font-medium text-white disabled:opacity-60"
      >
        Sign in
      </button>
    </form>
  );
}
