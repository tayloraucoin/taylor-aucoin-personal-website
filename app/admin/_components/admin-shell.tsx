"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminRoutes } from "@/lib/routes";

/**
 * One nav entry. `ready: false` renders the label without a link.
 *
 * Sections are listed before they exist on purpose: the shape of the tool is
 * useful information, and a dimmed label is honest where a link to a 404 is
 * not. Flip `ready` as each ticket lands — that flag is the only edit the
 * later tickets need to make here.
 */
type NavItem = { href: string; label: string; ready: boolean };

const NAV: NavItem[] = [
  { href: adminRoutes.queue, label: "Call queue", ready: true },
  { href: adminRoutes.leads, label: "Leads", ready: true },
  { href: adminRoutes.engagements, label: "Engagements", ready: true },
  { href: adminRoutes.sync, label: "Sync", ready: true },
  { href: adminRoutes.scoreboard, label: "Scoreboard", ready: true },
  { href: adminRoutes.transcripts, label: "Transcripts", ready: true },
];

export function AdminShell({
  email,
  signOut,
  children,
}: Readonly<{
  email: string;
  /** Bound server action — the shell is a client leaf and cannot own one. */
  signOut: () => Promise<void>;
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10">
        <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3">
          <Link
            href={adminRoutes.home}
            className="font-(family-name:--font-display) text-sm text-(--color-ink)"
          >
            Admin
          </Link>

          {NAV.map((item) =>
            item.ready ? (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  pathname.startsWith(item.href) ? "page" : undefined
                }
                className={
                  pathname.startsWith(item.href)
                    ? "text-sm text-(--color-c2)"
                    : "text-sm text-(--color-body) hover:text-(--color-ink)"
                }
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.href}
                title="Not built yet"
                className="text-sm text-(--color-dim)/60"
              >
                {item.label}
              </span>
            ),
          )}

          <form action={signOut} className="ml-auto flex items-center gap-3">
            <span className="text-xs text-(--color-dim)">{email}</span>
            <button
              type="submit"
              className="text-sm text-(--color-body) hover:text-(--color-ink)"
            >
              Sign out
            </button>
          </form>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
