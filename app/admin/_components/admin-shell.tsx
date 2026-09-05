"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { adminRoutes } from "@/lib/routes";
import { AdminSidebar } from "./admin-sidebar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";

/**
 * The frame every authenticated admin surface renders inside.
 *
 * Structure is Conscious Connections' — a persistent left rail of labelled
 * sections with items nested beneath them, off-canvas below `lg` — rebuilt in
 * this site's tokens rather than lifted from CC's shadcn sidebar, which this
 * repo does not have and is not getting. The taxonomy itself lives in
 * `admin-nav.ts`; this file is only the arrangement.
 *
 * The whole shell sits inside the `Sheet` root so the mobile menu button can be
 * a real `SheetTrigger`. That is what buys the focus trap, `Escape`, the scrim,
 * and — the part that is easy to lose by controlling `open` from the outside —
 * focus returning to the button that opened it.
 */
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
  const pathname = usePathname() ?? "";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /** Navigating is the end of the menu's job. */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <div className="flex min-h-dvh">
        <aside
          className={`sticky top-0 hidden h-dvh shrink-0 border-r border-(--color-faint) lg:block ${
            collapsed ? "w-14" : "w-60"
          }`}
        >
          <AdminSidebar
            email={email}
            signOut={signOut}
            pathname={pathname}
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((value) => !value)}
          />
        </aside>

        <SheetContent
          side="left"
          aria-label="Admin navigation"
          className="w-72 max-w-[85vw] p-0 lg:hidden"
        >
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <AdminSidebar
            email={email}
            signOut={signOut}
            pathname={pathname}
            collapsed={false}
          />
        </SheetContent>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-(--color-faint) lg:hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <SheetTrigger
                aria-label="Open navigation"
                className="flex size-11 items-center justify-center rounded-md text-(--color-body) transition-colors hover:bg-(--color-card-hover) hover:text-(--color-ink)"
              >
                <Menu aria-hidden className="size-5" />
              </SheetTrigger>

              <Link
                href={adminRoutes.home}
                className="flex items-center gap-2.5 text-(--color-ink)"
              >
                <Image
                  src="/icon.png"
                  alt=""
                  width={24}
                  height={24}
                  className="size-6 rounded-sm"
                />
                <span className="font-(family-name:--font-display) text-sm">
                  Admin
                </span>
              </Link>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl px-5 py-8">{children}</main>
        </div>
      </div>
    </Sheet>
  );
}
