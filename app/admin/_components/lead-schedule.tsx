"use client";

import { useEffect, useState, useTransition } from "react";
import { scheduleCallbackAction } from "@/app/admin/(protected)/leads/_actions/lead";
import { CALLBACK_CHIPS } from "@/lib/crm/constants";
import { startOfNextHour, toDatetimeLocalValue } from "@/lib/crm/datetime-local";
import type { ScheduleToken } from "@/server/services/calls";

const WHEN = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Vancouver",
  dateStyle: "medium",
  timeStyle: "short",
});

/**
 * Set or change when this lead comes back — without logging a dial.
 *
 * Same chip vocabulary as busy-callback in call mode (D-CRM-24): one home
 * for the tokens, a schedule-only write that never touches call_attempts.
 */
export function LeadSchedule({
  leadId,
  nextActionAt,
  nextActionNote,
}: {
  leadId: string;
  /** ISO string from the server — Dates do not cross the RSC boundary. */
  nextActionAt: string | null;
  nextActionNote: string | null;
}) {
  const [note, setNote] = useState(nextActionNote ?? "");
  const [savedNote, setSavedNote] = useState(nextActionNote ?? "");
  const [adjusted, setAdjusted] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [pickedAt, setPickedAt] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setNote(nextActionNote ?? "");
    setSavedNote(nextActionNote ?? "");
  }, [nextActionNote]);

  const scheduledAt = nextActionAt ? new Date(nextActionAt) : null;

  const field =
    "min-h-[44px] rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-c2)";

  const chip = (active: boolean) =>
    `min-h-[44px] rounded-(--radius) border px-3 text-sm disabled:opacity-50 ${
      active
        ? "border-(--color-c2)/60 bg-(--color-tint) text-(--color-ink)"
        : "border-(--color-line-strong) text-(--color-ink) hover:border-(--color-c2)/60"
    }`;

  const flashSaved = () => {
    setSaved(true);
    setError(null);
    setTimeout(() => setSaved(false), 1500);
  };

  const save = (input: {
    schedule?: ScheduleToken;
    nextActionAt?: Date;
    nextActionNote?: string;
  }) => {
    startTransition(async () => {
      const result = await scheduleCallbackAction({
        leadId,
        ...input,
        nextActionNote: input.nextActionNote ?? note,
      });

      if (result.ok) {
        flashSaved();
        if (input.nextActionNote !== undefined) {
          setSavedNote(input.nextActionNote);
        }
      } else {
        setError(result.message);
      }
    });
  };

  const applyPicked = (value: string) => {
    if (!value) return;
    save({ nextActionAt: new Date(value) });
    setAdjusted("at the time you picked");
  };

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm text-(--color-ink)">Callback</h3>

      <p className="text-sm text-(--color-body)">
        {scheduledAt
          ? `Next action ${WHEN.format(scheduledAt)}`
          : "No callback scheduled."}
        {nextActionNote && scheduledAt ? ` — ${nextActionNote}` : null}
      </p>

      <p className="text-xs text-(--color-dim)">
        {adjusted
          ? `Coming back ${adjusted.toLowerCase()}.`
          : "Pick when to call back."}
      </p>

      <div className="flex flex-wrap gap-2">
        {CALLBACK_CHIPS.map((option) => (
          <button
            key={option.token}
            type="button"
            disabled={pending}
            onClick={() => {
              setPicking(false);
              save({ schedule: option.token as ScheduleToken });
              setAdjusted(option.label);
            }}
            aria-pressed={!picking && adjusted === option.label}
            className={chip(!picking && adjusted === option.label)}
          >
            {option.label}
          </button>
        ))}
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            const value = toDatetimeLocalValue(startOfNextHour());
            setPickedAt(value);
            setPicking(true);
            applyPicked(value);
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
          onChange={(event) => {
            const value = event.target.value;
            setPickedAt(value);
            applyPicked(value);
          }}
          aria-label="Callback time"
          data-typing
          className={field}
        />
      ) : null}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-(--color-dim)">
          Note — who to ask for, what to cover
        </span>
        <input
          type="text"
          value={note}
          placeholder="Call back to talk to the boss"
          onChange={(event) => setNote(event.target.value)}
          onBlur={() => {
            if (note === savedNote) return;
            save({ nextActionNote: note });
          }}
          data-typing
          className={field}
        />
      </label>

      {error ? (
        <p role="alert" className="text-sm text-(--color-c2)">
          {error}
        </p>
      ) : null}

      {saved ? (
        <p className="text-xs text-(--color-dim)">Saved</p>
      ) : null}

      {pending ? <span className="sr-only">Saving</span> : null}
    </section>
  );
}
