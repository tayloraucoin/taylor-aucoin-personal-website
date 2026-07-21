"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { CaseStudy } from "@/content/work";
import CaseBody from "./CaseBody";

/**
 * The full-screen panel that slides up from the bottom edge — the interaction
 * Taylor singled out on saidalachgar.dev ("elegantly opens a bottom container
 * that takes up the screen... very well executed").
 *
 * Rendered by the intercepting route, so the URL is real. Refresh or paste it
 * and you get the full page instead.
 *
 * Accessibility floor: focus trap, Escape closes, backdrop closes, focus
 * returns to the originating row. Not optional.
 */
export default function CaseOverlay({ c }: { c: CaseStudy }) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [router]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-[rgb(3_5_16/.72)] backdrop-blur-sm"
      onClick={() => router.back()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={c.title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="h-[94dvh] w-full animate-[slideup_450ms_cubic-bezier(.2,.8,.2,1)] overflow-y-auto rounded-t-[--radius] border-t border-[rgb(232_185_97/.28)] outline-none"
        style={{
          background:
            "linear-gradient(172deg, var(--color-ground-a) 0%, var(--color-ground-b) 100%)",
        }}
      >
        <button
          onClick={() => router.back()}
          aria-label="Close"
          className="sticky top-0 z-10 float-right m-4 rounded-[--radius] border border-[--color-faint] bg-[rgb(9_12_34/.7)] px-3 py-2 font-mono text-[10px] uppercase tracking-[.16em] text-[--color-body] backdrop-blur transition-colors hover:border-[rgb(232_185_97/.55)] hover:text-[--color-ink]"
        >
          Esc
        </button>
        <CaseBody c={c} />
        <style>{`@keyframes slideup { from { transform: translateY(40px); opacity: 0 } to { transform: none; opacity: 1 } }`}</style>
      </div>
    </div>
  );
}
