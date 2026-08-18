"use client";

import { useEffect, useState } from "react";
import { GA_MEASUREMENT_ID } from "@/lib/config";
import type { ConsentChoice } from "@/lib/consent/constants";
import {
  CONSENT_CHANGED_EVENT,
  readStoredChoice,
  writeStoredChoice,
} from "./Analytics";

/**
 * The opt-out. Lives on /privacy.
 *
 * Required, not decorative: the notice-and-opt-out jurisdictions (US states,
 * Canada outside Quebec, Brazil) let analytics run by default but oblige us to
 * give the visitor a way to turn it off. Global Privacy Control covers the
 * automated version of that duty; this covers the visitor who wants to click
 * something. It also lets anyone who declined the banner change their mind,
 * which the banner itself cannot do once dismissed.
 */
export default function ConsentControl() {
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setChoice(readStoredChoice());
    sync();
    setReady(true);
    window.addEventListener(CONSENT_CHANGED_EVENT, sync);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, sync);
  }, []);

  if (!GA_MEASUREMENT_ID) return null;

  const set = (next: ConsentChoice) => {
    writeStoredChoice(next);
    setChoice(next);
  };

  const action =
    "rounded-(--radius) border border-(--color-faint) bg-[rgb(9_12_34/.55)] px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[.16em] transition-colors duration-(--dur-fast) hover:border-[rgb(232_185_97/.55)] disabled:cursor-default disabled:opacity-40 disabled:hover:border-(--color-faint)";

  return (
    <div className="mt-5 rounded-(--radius) border border-(--color-spec-border) bg-(--color-spec-bg) p-5">
      <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[.28em] text-(--color-c2)">
        Your choice
      </p>
      <p
        className="mb-4 text-[13px] leading-[1.55] text-(--color-body)"
        aria-live="polite"
      >
        {!ready
          ? "Checking…"
          : choice === "granted"
            ? "Analytics is on for this browser."
            : choice === "denied"
              ? "Analytics is off for this browser."
              : "No choice saved for this browser yet."}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => set("granted")}
          disabled={!ready || choice === "granted"}
          className={`${action} text-(--color-c2) hover:text-(--color-c3)`}
        >
          Turn on
        </button>
        <button
          type="button"
          onClick={() => set("denied")}
          disabled={!ready || choice === "denied"}
          className={`${action} text-(--color-body) hover:text-(--color-ink)`}
        >
          Turn off
        </button>
      </div>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[.16em] text-(--color-dim)">
        Saved in this browser only · Takes effect immediately
      </p>
    </div>
  );
}
