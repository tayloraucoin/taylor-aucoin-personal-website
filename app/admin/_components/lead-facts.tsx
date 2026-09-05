"use client";

import { useState } from "react";
import type { QueueLead } from "@/server/services/leads";
import { DISPOSITION_LABELS } from "@/lib/crm/constants";
import { StageChip } from "./chips";

/**
 * Who is being called, and everything the opener needs.
 *
 * Shared by the pre-call panel and call mode so the two cannot drift: the
 * facts Taylor reads before dialing are the same facts he reads while the
 * phone is ringing, and a business whose review count changed between the
 * two screens would be a bug nobody would think to look for.
 */

/** The number, big, with the one interaction that matters beside it. */
export function PhoneBlock({
  phone,
  children,
}: {
  phone: string;
  /** The primary action for this phase — Call now, or nothing. */
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  if (!phone) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-(--color-dim)">No phone number on file.</p>
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={`tel:${phone.replace(/[^\d+]/g, "")}`}
        className="font-(family-name:--font-mono) text-2xl text-(--color-ink)"
      >
        {phone}
      </a>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(phone);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="min-h-[44px] rounded-(--radius) border border-(--color-line-strong) px-3 text-sm text-(--color-body)"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      {children}
    </div>
  );
}

/** Name, trade, proof, and the advisory lines. Never an alarm (D-CRM-22). */
export function LeadFacts({
  lead,
  children,
}: {
  lead: QueueLead;
  /** Slotted beside the name — "Full record", or nothing in call mode. */
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-(family-name:--font-display) text-lg text-(--color-ink)">
          {lead.businessName}
        </h2>
        <StageChip stage={lead.stage} />
        {children}
      </div>

      <p className="text-sm text-(--color-body)">
        {lead.niche} · {lead.city}
        {lead.rating !== null ? (
          <>
            {" · "}
            <span className="text-(--color-ink)">
              {lead.rating} × {lead.reviews ?? 0} reviews
            </span>
          </>
        ) : null}
      </p>

      {lead.address || lead.mapsUrl ? (
        <p className="text-sm text-(--color-dim)">
          {lead.address}
          {lead.mapsUrl ? (
            <>
              {lead.address ? " · " : null}
              <a
                href={lead.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Map
              </a>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The advisory lines: when this trade answers, what the season does to the
 * pitch, whether a walk-in beats a call. All three state facts and never
 * pressure — no countdowns, no colour as status (D-CRM-20, D-CRM-22).
 */
export function LeadAdvisories({
  lead,
  showSeasonal = true,
}: {
  lead: QueueLead;
  /** False in call mode, where the script column carries it instead — the
   * season changes the pitch, so it belongs beside the words (§3.8). */
  showSeasonal?: boolean;
}) {
  return (
    <>
      <p className="text-xs text-(--color-dim)">
        {lead.window.label}
        {lead.window.avoidNote ? ` — ${lead.window.avoidNote}` : ""}
      </p>

      {showSeasonal && lead.window.seasonalNote ? (
        <p className="border-l-2 border-(--color-c2)/40 pl-3 text-xs text-(--color-body)">
          {lead.window.seasonalNote}
        </p>
      ) : null}

      {lead.window.walkInViable ? (
        <p className="text-xs text-(--color-dim)">
          Walk-in beats a call for these.
        </p>
      ) : null}

      {lead.attemptCount > 0 ? (
        <p className="text-xs text-(--color-dim)">
          {lead.attemptCount} {lead.attemptCount === 1 ? "try" : "tries"}
          {lead.lastDisposition
            ? ` · last: ${DISPOSITION_LABELS[lead.lastDisposition].toLowerCase()}`
            : ""}
        </p>
      ) : null}
    </>
  );
}
