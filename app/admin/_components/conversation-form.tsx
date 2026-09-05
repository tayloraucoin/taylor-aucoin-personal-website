"use client";

import { useState } from "react";
import { INTEREST_TAG_LABELS } from "@/lib/crm/constants";
import { startOfNextHour, toDatetimeLocalValue } from "@/lib/crm/datetime-local";
import type { ContactChannel, InterestTag } from "@/lib/types/crm";
import type { ScheduleToken } from "@/server/services/calls";
import type { QueueLead } from "@/server/services/leads";

/**
 * What a conversation captured, committed in one Save (D-CRM-25).
 *
 * Every field is optional. A conversation logged with nothing but the
 * disposition is a complete, valid call — the same law that governs the
 * disposition row governs this form (D-CRM-8), and a required field here
 * would quietly make the most valuable outcome the most expensive to record.
 *
 * The form owns its own values so a failed Save loses nothing: the component
 * stays mounted, the text stays where it was typed, and the retry sends the
 * same payload rather than an empty one.
 */

export type ConversationValues = {
  contactName: string;
  contactEmail: string;
  phoneOverride: string;
  preferredChannel: ContactChannel | null;
  interestTags: InterestTag[];
  schedule: ScheduleToken | null;
  /** Set only when "Pick a time" is used; wins over `schedule` server-side. */
  nextActionAt: Date | null;
};

const INTEREST_ORDER: InterestTag[] = [
  "wants_info",
  "decision_maker",
  "price_talk",
  "ready_for_intake",
  "not_now",
];

/**
 * Next-touch options, in the order a call actually produces them.
 *
 * `null` is the default and means "let the cadence decide" — the service
 * gives a conversation three business days (D-CRM-5), which is the right
 * answer whenever the prospect did not name a time. Every other option is a
 * token resolved on the server, never a datetime computed in this browser
 * (M-CRM-6's law, and the reason a callback cannot land an hour off).
 */
const NEXT_TOUCH: { token: ScheduleToken | null; label: string }[] = [
  { token: null, label: "In 3 business days" },
  { token: "tomorrow_am", label: "Tomorrow AM" },
  { token: "tomorrow_pm", label: "Tomorrow PM" },
  { token: "next_week", label: "Next week" },
  { token: "in_1_month", label: "1 month" },
  { token: "in_3_months", label: "3 months" },
];

/** The default next touch, per the tags on the call (D-CRM-25). */
function defaultScheduleFor(tags: InterestTag[]): ScheduleToken | null {
  // "Not now" is a timing answer, so it outranks the generic follow-up: a
  // prospect who said "after the season" should not be chased on Thursday.
  return tags.includes("not_now") ? "in_1_month" : null;
}

/**
 * Whether timing is actually an open question on this call.
 *
 * "Wants info", "price talk", and "ready for intake" all have a clear next
 * step already — the cadence's silent 3-business-day default is the right
 * answer and asking Taylor to confirm it on every single conversation is
 * asking a question that has no real decision behind it. "Talk to the boss"
 * and "not now" are different: both are, in substance, "call back later",
 * and the *when* is a fact from the call, not a default to accept.
 */
function needsNextTouch(tags: InterestTag[]): boolean {
  return tags.includes("decision_maker") || tags.includes("not_now");
}

export function ConversationForm({
  lead,
  disabled,
  onSave,
  onBack,
}: {
  lead: QueueLead;
  disabled: boolean;
  onSave: (values: ConversationValues) => void;
  onBack: () => void;
}) {
  const [contactName, setContactName] = useState(lead.contactName ?? "");
  const [contactEmail, setContactEmail] = useState(lead.contactEmail ?? "");
  const [phoneOverride, setPhoneOverride] = useState("");
  const [preferredChannel, setPreferredChannel] =
    useState<ContactChannel | null>(lead.preferredChannel ?? null);
  const [interestTags, setInterestTags] = useState<InterestTag[]>([]);
  const [schedule, setSchedule] = useState<ScheduleToken | null>(null);
  /** Whether the caller has overridden the tag-derived default. */
  const [scheduleTouched, setScheduleTouched] = useState(false);
  const [picking, setPicking] = useState(false);
  const [pickedAt, setPickedAt] = useState("");

  const effectiveSchedule = scheduleTouched
    ? schedule
    : defaultScheduleFor(interestTags);

  const toggleTag = (tag: InterestTag) =>
    setInterestTags((prior) =>
      prior.includes(tag) ? prior.filter((t) => t !== tag) : [...prior, tag],
    );

  const field =
    "min-h-[44px] rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-c2)";

  const chip = (active: boolean) =>
    `min-h-[44px] rounded-(--radius) border px-3 text-sm disabled:opacity-50 ${
      active
        ? "border-(--color-c2)/60 bg-(--color-tint) text-(--color-ink)"
        : "border-(--color-line-strong) text-(--color-ink) hover:border-(--color-c2)/60"
    }`;

  return (
    // `fieldset disabled` rather than opacity: a dimmed control that is still
    // operable lies to a screen reader about what can be done.
    <fieldset disabled={disabled} className="flex flex-col gap-5 border-0 p-0">
      <legend className="sr-only">What the conversation produced</legend>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-(--color-dim)">Their name</span>
          <input
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            data-typing
            className={field}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-(--color-dim)">Their email</span>
          <input
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            data-typing
            className={field}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-(--color-dim)">
          A better number {lead.phone ? `(Google has ${lead.phone})` : ""}
        </span>
        <input
          type="tel"
          value={phoneOverride}
          onChange={(event) => setPhoneOverride(event.target.value)}
          data-typing
          className={field}
        />
      </label>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-(--color-dim)">
          How do they want the link?
        </p>
        <div className="flex flex-wrap gap-2">
          {(["text", "email"] as const).map((channel) => (
            <button
              key={channel}
              type="button"
              onClick={() =>
                setPreferredChannel((prior) =>
                  prior === channel ? null : channel,
                )
              }
              aria-pressed={preferredChannel === channel}
              className={chip(preferredChannel === channel)}
            >
              {channel === "text" ? "Text" : "Email"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-(--color-dim)">What came of it?</p>
        <div className="flex flex-wrap gap-2">
          {INTEREST_ORDER.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              aria-pressed={interestTags.includes(tag)}
              className={chip(interestTags.includes(tag))}
            >
              {INTEREST_TAG_LABELS[tag]}
            </button>
          ))}
        </div>
      </div>

      {needsNextTouch(interestTags) ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-(--color-dim)">When do they come back?</p>
          <div className="flex flex-wrap gap-2">
            {NEXT_TOUCH.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => {
                  setSchedule(option.token);
                  setScheduleTouched(true);
                  setPicking(false);
                  setPickedAt("");
                }}
                aria-pressed={!picking && effectiveSchedule === option.token}
                className={chip(!picking && effectiveSchedule === option.token)}
              >
                {option.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setPicking(true);
                setPickedAt((current) =>
                  current || toDatetimeLocalValue(startOfNextHour()),
                );
              }}
              aria-pressed={picking}
              className={chip(picking)}
            >
              Pick a time
            </button>
          </div>

          {picking ? (
            <input
              type="datetime-local"
              value={pickedAt}
              onChange={(event) => setPickedAt(event.target.value)}
              aria-label="Next touch"
              data-typing
              className={field}
            />
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() =>
            onSave({
              contactName,
              contactEmail,
              phoneOverride,
              preferredChannel,
              interestTags,
              schedule: picking ? null : effectiveSchedule,
              // `datetime-local` has no zone. Parsing it here reads it in the
              // browser's zone, which is Taylor's — the same clock he just
              // agreed the time in. The server validates it either way.
              nextActionAt: picking && pickedAt ? new Date(pickedAt) : null,
            })
          }
          className="min-h-[44px] rounded-(--radius) bg-(--color-action) px-4 text-sm font-medium text-white disabled:opacity-60"
        >
          {disabled ? "Saving…" : "Save"}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-2 text-sm text-(--color-dim) underline"
        >
          Back
        </button>
      </div>
    </fieldset>
  );
}
