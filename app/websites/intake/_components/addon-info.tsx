"use client";

import { useState } from "react";
import Overlay from "@/components/ui/Overlay";
import { addonDetails } from "@/content/addon-details";

/**
 * The "how it works" affordance on a P0 add-on row.
 *
 * A quiet mono link under the description, opening the site Overlay (sheet
 * variant — this is a page of process notes, not a contract). Same
 * read-it-right-here rule as the legal dialogs: a client mid-payment is
 * never navigated away.
 *
 * The button lives inside the row's `<label>`, so its click must
 * `preventDefault` — otherwise tapping "How it works" also toggles the
 * checkbox, and a client who opened the dialog out of caution finds the
 * add-on mysteriously selected when they close it. That is the opposite of
 * what caution should buy.
 */
export function AddonInfo({ productKey }: { productKey: string }) {
  const [open, setOpen] = useState(false);
  const detail = addonDetails[productKey];

  if (!detail) return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        className="mt-1.5 font-mono text-[10px] uppercase tracking-[.16em] text-(--color-dim) underline decoration-(--color-faint) underline-offset-4 transition-colors hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
      >
        How it works
      </button>

      {open ? (
        <Overlay label={detail.heading} variant="sheet" onClose={() => setOpen(false)}>
          <div className="mx-auto max-w-[560px] px-[22px] pt-4 pb-12">
            <h2 className="max-w-[24ch] font-display text-[clamp(22px,5vw,28px)] font-medium leading-[1.15] tracking-[-.02em] text-(--color-ink)">
              {detail.heading}
            </h2>

            <p className="mt-4 max-w-[48ch] font-body text-[16px] font-light leading-[1.66] text-(--color-body)">
              {detail.intro}
            </p>

            <div className="mt-8 space-y-7">
              {detail.sections.map((section) => (
                <section key={section.label}>
                  <h3 className="border-b border-(--color-faint) pb-2.5 font-mono text-[10px] uppercase tracking-[.24em] text-(--color-dim)">
                    {section.label}
                  </h3>
                  <p className="mt-3 max-w-[48ch] font-body text-[16px] font-light leading-[1.66] text-(--color-body)">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>

            {detail.boundary ? (
              <p className="mt-8 max-w-[48ch] border-t border-(--color-faint) pt-5 font-body text-[13.5px] font-light leading-[1.6] text-(--color-dim)">
                {detail.boundary}
              </p>
            ) : null}
          </div>
        </Overlay>
      ) : null}
    </>
  );
}
