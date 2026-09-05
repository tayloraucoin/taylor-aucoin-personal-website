"use client";

import { useMemo, useState } from "react";
import type { QueueLead } from "@/server/services/leads";
import { applyScriptVariables } from "@/lib/crm/call-script";
import { Markup } from "./markup";

/**
 * The script, beside the call — personalized to whoever is on the line.
 *
 * Advisory rendering and nothing more (CRM-15): it never gates a disposition,
 * never times anything, and carries no urgency device. If the sheet is
 * missing it says so plainly and logging carries on — a script that could
 * block a call from being logged would invert the whole point of the surface.
 *
 * The `{{placeholder}}` swap happens here, once, right before the string
 * reaches `Markup` — this is the one place that already holds both the raw
 * source and the selected lead, and it recomputes on every render, so
 * switching leads mid-block never shows a stale name.
 *
 * On mobile it collapses behind a toggle and starts closed (D-CRM-29): when
 * the phone is both the dialer and the screen, the disposition row is what
 * has to be under the thumb, not the reading material.
 */
export function CallSheetColumn({
  source,
  lead,
}: {
  /** The rendered call sheet, read server-side. Empty when unreadable. */
  source: string;
  lead: QueueLead;
}) {
  const [openOnMobile, setOpenOnMobile] = useState(false);

  const personalized = useMemo(
    () =>
      source
        ? applyScriptVariables(source, {
            contactName: lead.contactName,
            niche: lead.niche,
            city: lead.city,
            rating: lead.rating,
            reviews: lead.reviews,
          })
        : source,
    [source, lead.contactName, lead.niche, lead.city, lead.rating, lead.reviews],
  );

  return (
    <section aria-label="Call sheet" className="flex flex-col gap-4">
      {/* The season changes the pitch, so it sits with the script rather than
          with the facts — the roofer booked into October needs a different
          opening line, not a different dialing time (D-CRM-20). */}
      {lead.window.seasonalNote ? (
        <p className="border-l-2 border-(--color-c2)/40 pl-3 text-sm text-(--color-body)">
          {lead.window.seasonalNote}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => setOpenOnMobile((prior) => !prior)}
        aria-expanded={openOnMobile}
        className="min-h-[44px] w-fit rounded-(--radius) border border-(--color-line-strong) px-3 text-sm text-(--color-body) lg:hidden"
      >
        {openOnMobile ? "Hide the script" : "Show the script"}
      </button>

      <div className={openOnMobile ? "block" : "hidden lg:block"}>
        {personalized ? (
          <Markup source={personalized} />
        ) : (
          <p className="text-sm text-(--color-dim)">
            The call sheet couldn&rsquo;t be loaded. It lives at
            docs/crm/CALL-SHEET.md — logging works regardless.
          </p>
        )}
      </div>
    </section>
  );
}
