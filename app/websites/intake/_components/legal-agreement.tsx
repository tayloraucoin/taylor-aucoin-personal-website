"use client";

import { useState } from "react";
import Overlay from "@/components/ui/Overlay";
import LegalArticle from "@/components/websites/legal/LegalArticle";
import { privacy, terms } from "@/content/legal";

/**
 * The terms row on P0: a real checkbox and the acceptance sentence, directly
 * above the pay button (D-INT-11 — the checkbox strengthens the clickwrap
 * record now that the screen carries other checkboxes; a lone notice line
 * next to a column of add-on checkboxes would read as decoration).
 *
 * Both documents open in the site's Overlay rather than navigating away: a
 * client mid-payment who is sent to another page may not come back. The
 * standalone pages at /websites/terms and /websites/privacy stay the
 * canonical URLs; this dialog renders the same content module, so the two
 * can never disagree.
 *
 * Controlled by the parent, which owns the pay button's disabled state
 * (D-INT-11 as amended: the CTA waits for this box).
 */
export function LegalAgreement({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const [open, setOpen] = useState<"terms" | "privacy" | null>(null);

  const linkClass =
    "underline decoration-(--color-faint) underline-offset-4 transition-colors hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)";

  return (
    <>
      <label className="flex min-h-12 cursor-pointer items-start gap-3.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={`mt-[2px] flex h-5 w-5 shrink-0 items-center justify-center rounded-(--radius) border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--color-c2) ${
            checked
              ? "border-(--color-c2) bg-(--color-c2)"
              : "border-(--color-faint) bg-transparent"
          }`}
        >
          {checked ? (
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
              <path
                d="M1 4.5L4 7.5L10 1"
                stroke="var(--color-ground-a)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
        <span className="max-w-[46ch] font-body text-[13.5px] font-light leading-[1.6] text-(--color-dim)">
          I agree to the{" "}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setOpen("terms");
            }}
            className={linkClass}
          >
            website services terms
          </button>{" "}
          and the{" "}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setOpen("privacy");
            }}
            className={linkClass}
          >
            privacy policy
          </button>
          . Both open right here.
        </span>
      </label>

      {open !== null ? (
        <Overlay
          label={open === "terms" ? "Website services terms" : "Privacy policy"}
          variant="full"
          onClose={() => setOpen(null)}
        >
          <div className="mx-auto max-w-[660px] px-[22px] py-12">
            <LegalArticle doc={open === "terms" ? terms : privacy} />
          </div>
        </Overlay>
      ) : null}
    </>
  );
}
