"use client";

import { useState } from "react";
import Link from "next/link";
import { INTEREST_TAG_LABELS } from "@/lib/crm/constants";
import { adminRoutes } from "@/lib/routes";
import type { InterestTag } from "@/lib/types/crm";
import type { QueueLead } from "@/server/services/leads";
import { IntroEmailForm } from "./intro-email-form";
import type { CompletedAction } from "./post-call-panel";

/**
 * The receipt at the end of a conversation (§3.8 state 4, D-CRM-27).
 *
 * Read-only on purpose. Its job is to close the loop — here is what was
 * saved, here is when they come back, here is what went out — not to offer a
 * second chance to edit it. Anything wrong gets fixed on the full record,
 * which is one link away; inline editing here would mean a second write path
 * for facts that were just committed in a single transaction.
 *
 * Non-conversation calls never reach this. Forty no-answers should not cost
 * forty confirmation screens; their lit disposition already said everything.
 */

const WHEN = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Vancouver",
  dateStyle: "medium",
  timeStyle: "short",
});

export type ReviewSummary = {
  contactName: string;
  contactEmail: string;
  phoneOverride: string;
  preferredChannel: "text" | "email" | null;
  interestTags: InterestTag[];
  /** The date actually committed by the save, not the one that was asked for. */
  nextActionAt: Date | null;
  notes: string;
};

export function CallReview({
  lead,
  summary,
  completed,
  onAdvance,
}: {
  lead: QueueLead;
  summary: ReviewSummary;
  completed: CompletedAction[];
  onAdvance: () => void;
}) {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const forDecisionMaker = summary.interestTags.includes("decision_maker");
  const capturedEmail = summary.contactEmail.trim();
  const emailAlreadySent =
    completed.some((action) => action.kind === "email") || sentTo !== null;
  const showEmailForm = capturedEmail !== "" && !emailAlreadySent;

  const allCompleted: CompletedAction[] = sentTo
    ? [...completed, { kind: "email", to: sentTo }]
    : completed;

  const captured: { label: string; value: string }[] = [
    { label: "Name", value: summary.contactName },
    { label: "Email", value: summary.contactEmail },
    { label: "Better number", value: summary.phoneOverride },
    {
      label: "Prefers",
      value: summary.preferredChannel
        ? summary.preferredChannel === "text"
          ? "Text"
          : "Email"
        : "",
    },
  ].filter((row) => row.value.trim() !== "");

  return (
    <div className="flex flex-col gap-4 rounded-(--radius) border border-(--color-c2)/40 p-4">
      <h3 className="text-sm text-(--color-ink)">
        {lead.businessName} — logged
      </h3>

      {captured.length > 0 ? (
        <dl className="flex flex-col gap-1">
          {captured.map((row) => (
            <div key={row.label} className="flex flex-wrap gap-x-2 text-sm">
              <dt className="text-(--color-dim)">{row.label}</dt>
              <dd className="text-(--color-body)">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {summary.interestTags.length > 0 ? (
        <p className="text-sm text-(--color-body)">
          {summary.interestTags
            .map((tag) => INTEREST_TAG_LABELS[tag])
            .join(" · ")}
        </p>
      ) : null}

      <p className="text-sm text-(--color-ink)">
        {summary.nextActionAt
          ? `Back on ${WHEN.format(summary.nextActionAt)}.`
          : "Closed — nothing scheduled."}
      </p>

      {summary.notes.trim() ? (
        <p className="text-sm whitespace-pre-wrap text-(--color-body)">
          {summary.notes}
        </p>
      ) : null}

      {showEmailForm ? (
        <section className="flex flex-col gap-3">
          <h4 className="text-sm text-(--color-body)">Intro email</h4>
          <IntroEmailForm
            leadId={lead.id}
            hasEmail={Boolean(capturedEmail)}
            forDecisionMaker={forDecisionMaker}
            onSent={setSentTo}
          />
        </section>
      ) : null}

      <div className="flex flex-col gap-1">
        {allCompleted.length === 0 && !showEmailForm ? (
          <p className="text-xs text-(--color-dim)">Nothing else was owed.</p>
        ) : (
          allCompleted.map((action) => (
            <p key={action.kind} className="text-xs text-(--color-body)">
              {action.kind === "email"
                ? `Intro email sent to ${action.to}.`
                : action.kind === "text"
                  ? "Link texted."
                  : action.kind === "intake"
                    ? "Intake link created."
                    : "No email on file — nothing was sent."}
            </p>
          ))
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onAdvance}
          className="min-h-[44px] rounded-(--radius) bg-(--color-c1) px-4 text-sm font-medium text-white"
        >
          Next lead
        </button>
        <Link
          href={`${adminRoutes.queue}?lead=${lead.id}`}
          scroll={false}
          className="min-h-[44px] px-2 py-2.5 text-sm text-(--color-dim) underline"
        >
          Fix something on the record
        </Link>
      </div>
    </div>
  );
}
