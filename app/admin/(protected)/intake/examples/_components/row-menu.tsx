"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import type { ExampleSiteDraft } from "@/lib/intake/example-packs";
import { setStatusAction } from "../_actions/examples";

/**
 * What you can do to a site without leaving the list.
 *
 * The first cut had none of this: a row was a bare link, so publishing forty
 * tagged sites meant forty round trips through a detail page. Every action that
 * does not need a form belongs here.
 *
 * Publish still runs the gate — the button says why it cannot rather than
 * disappearing, because "no publish option on this row" is a worse answer than
 * "not yet, there's no media".
 */
export function RowMenu({ site }: { site: ExampleSiteDraft }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (event: MouseEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    const esc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const move = (status: "draft" | "published" | "archived") =>
    startTransition(async () => {
      const result = await setStatusAction(site.slug, status);
      if (result.ok) {
        setOpen(false);
        setMessage(null);
        router.refresh();
      } else {
        setMessage(result.message);
      }
    });

  const item =
    "block w-full px-3 py-2 text-left text-sm text-(--color-body) hover:bg-(--color-card-hover) hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-(--color-c2)";

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${site.name || site.slug}`}
        onClick={() => setOpen((was) => !was)}
        className="flex size-9 items-center justify-center rounded-(--radius) border border-transparent text-(--color-dim) hover:border-(--color-line) hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
      >
        <MoreHorizontal size={16} aria-hidden />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-10 z-20 flex w-60 flex-col rounded-(--radius) border border-(--color-line) bg-(--color-card) py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={() => {
              setOpen(false);
              router.push(`?site=${site.slug}`, { scroll: false });
            }}
          >
            {/* [COPY — draft] */}
            Edit
          </button>

          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={() => {
              setOpen(false);
              router.push(`?preview=${site.slug}`, { scroll: false });
            }}
          >
            {/* [COPY — draft] */}
            Preview as a client
          </button>

          <a
            role="menuitem"
            href={site.url}
            target="_blank"
            rel="noreferrer noopener"
            className={item}
            onClick={() => setOpen(false)}
          >
            Open the site ↗
          </a>

          <span className="my-1 border-t border-(--color-faint)" />

          {site.status === "published" ? (
            <button
              type="button"
              role="menuitem"
              className={item}
              disabled={pending}
              onClick={() => move("draft")}
            >
              Unpublish
            </button>
          ) : site.status === "archived" ? (
            <button
              type="button"
              role="menuitem"
              className={item}
              disabled={pending}
              onClick={() => move("draft")}
            >
              Restore as draft
            </button>
          ) : (
            <button
              type="button"
              role="menuitem"
              className={item}
              disabled={pending}
              onClick={() => {
                if (site.blockers.length > 0) {
                  setMessage(`Not yet — ${site.blockers.join(", and ")}.`);
                  return;
                }
                move("published");
              }}
            >
              Publish
            </button>
          )}

          {site.status !== "archived" ? (
            <button
              type="button"
              role="menuitem"
              className={item}
              onClick={() => {
                setOpen(false);
                setConfirming(true);
              }}
            >
              Archive
            </button>
          ) : null}

          {message ? (
            <p className="max-w-[15rem] px-3 py-2 text-xs text-(--color-body)">
              {message}
            </p>
          ) : null}
        </div>
      ) : null}

      {confirming ? (
        <div
          role="dialog"
          aria-modal
          aria-label={`Archive ${site.name || site.slug}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-(--color-ground-a)/80 p-6"
        >
          <div className="flex max-w-[42ch] flex-col gap-4 rounded-(--radius) border border-(--color-line) bg-(--color-card) p-5">
            <p className="text-sm text-(--color-ink)">
              {/* [COPY — draft] — the consequence nobody thinks about. */}
              Archive {site.name || site.slug}? It leaves the gallery. Anyone
              who already picked it keeps their pick.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="min-h-[44px] rounded-(--radius) border border-(--color-line) px-3 text-sm text-(--color-body)"
              >
                Cancel
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => {
                  setConfirming(false);
                  move("archived");
                }}
                className="min-h-[44px] rounded-(--radius) border border-(--color-line-strong) px-3 text-sm text-(--color-ink)"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
