"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Overlay from "@/components/ui/Overlay";
import {
  CATEGORIES,
  capabilities,
  type Capability,
  type Category,
} from "@/content/capabilities";
import { BOOKING_URL } from "@/lib/config";

/**
 * GRID-01/02/03 — the body of /capabilities (the page provides the h1).
 * Flat interactive cards — quieter than the ringed offer cards on /services,
 * and 12 rings would cost 12 rAF loops. The filter input matches title,
 * tech, approach, and a hidden keyword list, so a visitor can type THEIR
 * problem ("square", "migrations") and see whether it lands. Zero matches
 * is a conversion moment, not a dead end.
 *
 * Dialogs are the shared Overlay shell in its compact sheet variant —
 * client state, no URL. Focus returns to the originating card on close.
 */
export default function CapabilityGrid() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<Category | null>(null);
  const [open, setOpen] = useState<Capability | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const q = query.trim().toLowerCase();
  const visible = capabilities.filter((c) => {
    if (tag && !c.tags.includes(tag)) return false;
    if (!q) return true;
    return [c.title, c.tech, c.approach, c.offer, ...c.keywords]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  const close = () => {
    setOpen(null);
    triggerRef.current?.focus();
  };

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="max-w-[48ch] text-[13.5px] font-light leading-[1.64] text-(--color-body)">
          Problems I take on. Open a card for the approach and where it was
          done.
        </p>
        <input
          data-interactive
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter — payments, search, AI…"
          aria-label="Filter capabilities"
          className="w-full max-w-[280px] rounded-(--radius) border border-(--color-faint) bg-[rgb(9_12_34/.55)] px-3.5 py-2.5 text-[13px] font-light text-(--color-ink) outline-none backdrop-blur-[6px] transition-colors duration-(--dur-fast) placeholder:text-(--color-dim) focus:border-[rgb(232_185_97/.42)] [&::-webkit-search-cancel-button]:hidden"
        />
      </div>

      {/* Toggle tags — one active at a time, click again to clear. Composes
          with the text filter (AND). */}
      <div className="mt-5 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const active = tag === cat;
          return (
            <button
              key={cat}
              type="button"
              aria-pressed={active}
              onClick={() => setTag(active ? null : cat)}
              className={`rounded-(--radius) border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.2em] transition-colors duration-(--dur-fast) ${
                active
                  ? "border-[rgb(232_185_97/.55)] bg-[rgb(232_185_97/.08)] text-(--color-c2)"
                  : "border-(--color-faint) text-(--color-dim) hover:border-[rgb(232_185_97/.3)] hover:text-(--color-body)"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {visible.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
            <button
              key={c.slug}
              type="button"
              aria-haspopup="dialog"
              onClick={(e) => {
                triggerRef.current = e.currentTarget;
                setOpen(c);
              }}
              className="group flex flex-col rounded-(--radius) border border-(--color-spec-border) bg-(--color-spec-bg) p-5 text-left transition-colors duration-(--dur-base) ease-(--ease-out) hover:border-[rgb(232_185_97/.35)] hover:bg-(--color-card-hover)"
            >
              <span className="max-w-[40ch] font-display text-[15px] font-medium leading-[1.35] tracking-[-.012em] text-(--color-ink)">
                {c.title}
              </span>
              <span className="mt-2 font-mono text-[9px] uppercase tracking-[.2em] text-(--color-dim)">
                {c.tech}
              </span>
              {c.proof && (
                <span className="mt-3.5 font-mono text-[9px] uppercase tracking-[.2em] text-[rgb(232_185_97/.55)]">
                  {c.proof.map((p) => p.label).join(" · ")}
                </span>
              )}
              <span
                aria-hidden
                className="mt-3 font-mono text-[10px] text-(--color-dim) opacity-0 transition-opacity duration-(--dur-fast) group-hover:opacity-100"
              >
                →
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-[13.5px] font-light leading-[1.64] text-(--color-body)">
          Nothing by that name —{" "}
          <Link
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-(--color-c2) transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
          >
            ask me anyway →
          </Link>
        </p>
      )}

      {open && (
        <Overlay label={open.title} variant="sheet" onClose={close}>
          <div className="mx-auto max-w-[720px] px-[22px] pb-14 pt-10 md:px-0 md:pt-12">
            <p className="mb-3 font-mono text-[9px] uppercase tracking-[.24em] text-(--color-c2)">
              {open.tech}
            </p>
            <h2 className="mb-4 font-display text-[24px] font-medium leading-[1.2] tracking-[-.015em] text-(--color-ink)">
              {open.title}
            </h2>
            <p className="mb-6 max-w-[56ch] text-[15px] font-light leading-[1.66] text-(--color-body)">
              {open.approach}
            </p>
            {open.proof && (
              <p className="mb-6 flex flex-wrap gap-x-5 gap-y-2">
                {open.proof.map((p) =>
                  p.external ? (
                    <a
                      key={p.label}
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-c2) transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
                    >
                      {p.label} →
                    </a>
                  ) : (
                    <Link
                      key={p.label}
                      href={p.href}
                      className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-c2) transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
                    >
                      {p.label} →
                    </Link>
                  ),
                )}
              </p>
            )}
            <p className="border-t border-(--color-faint) pt-5 font-mono text-[9px] uppercase tracking-[.2em] text-(--color-dim)">
              Usually shows up as · {open.offer}
            </p>
          </div>
        </Overlay>
      )}
    </section>
  );
}
