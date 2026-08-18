"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";

/**
 * Consent banner (bottom-left corner card).
 *
 * Only ever rendered for visitors in a prior-consent jurisdiction who have not
 * yet chosen — see `lib/consent/jurisdictions.ts`. Everyone else never sees it.
 *
 * Design notes, since none of this is in DESIGN-SYSTEM.md:
 *  - No gradient anywhere. Invariant 3 rations gradient to the primary CTA, and
 *    a cookie notice is emphatically not the primary CTA. Invariant 2 says the
 *    CTA must be the brightest thing on screen; a gradient here would outshout
 *    "Work with me", which is the one thing this page is for.
 *  - Accept and Decline are the same size, border, background and typeface, and
 *    both are one click. They differ only in text colour. Making Decline harder
 *    to find than Accept is the dark pattern the EDPB guidelines exist to stop,
 *    and it would also just be rude.
 *  - Entrance is a CSS transition, not Motion. globals.css already collapses
 *    every transition under prefers-reduced-motion, so invariant 7 is satisfied
 *    without a second code path.
 *  - Buttons are real <button>s, so RootField's "a,button" match fades the
 *    cursor-glow on hover for free. Invariant 2, no wiring.
 *
 * Copy is placeholder pending Taylor's pass.
 */
export default function ConsentBanner({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  const [shown, setShown] = useState(false);
  const titleId = useId();

  // Two frames: mount at rest state, then transition in. Setting both in the
  // same paint would skip the transition entirely.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const action =
    "rounded-(--radius) border border-(--color-faint) bg-[rgb(9_12_34/.55)] px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[.16em] transition-colors duration-(--dur-fast) hover:border-[rgb(232_185_97/.55)]";

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className={`fixed bottom-0 left-0 z-40 m-4 w-[min(380px,calc(100vw-2rem))] rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-5 backdrop-blur-[6px] transition-[opacity,transform] duration-(--dur-base) ease-(--ease-out) md:m-6 ${
        shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <p
        id={titleId}
        className="mb-2.5 font-mono text-[10px] uppercase tracking-[.28em] text-(--color-c2)"
      >
        Analytics
      </p>

      <p className="mb-4 text-[13px] leading-[1.55] text-(--color-body)">
        Google Analytics counts page views here. No advertising, no profiles,
        nothing sold. Decline and the script never loads.{" "}
        <Link
          href="/privacy"
          className="text-(--color-dim) underline underline-offset-2 transition-colors duration-(--dur-fast) hover:text-(--color-c2)"
        >
          Privacy
        </Link>
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onAccept}
          className={`${action} text-(--color-c2) hover:text-(--color-c3)`}
        >
          Accept
        </button>
        <button
          type="button"
          onClick={onDecline}
          className={`${action} text-(--color-body) hover:text-(--color-ink)`}
        >
          Decline
        </button>
      </div>
    </div>
  );
}
