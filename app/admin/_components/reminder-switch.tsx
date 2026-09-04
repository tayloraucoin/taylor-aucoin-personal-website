"use client";

import { useState, useTransition } from "react";
import { setRemindersAction } from "@/app/admin/(protected)/engagements/_actions/reminders";

const WHEN = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Vancouver",
  dateStyle: "medium",
  timeStyle: "short",
});

const KIND_LABELS: Record<string, string> = {
  reminder_1: "First reminder",
  reminder_2: "Second reminder",
  reminder_3: "Last reminder",
};

/**
 * Reminder history and the switch that stops them.
 *
 * The remaining count is stated plainly because three is the whole allowance —
 * a client who has had all three will never hear from the sweep again, and
 * that is the promise, not a limit to work around.
 */
export function ReminderSwitch({
  engagementId,
  disabled,
  sent,
  remaining,
  history,
}: {
  engagementId: string;
  disabled: boolean;
  sent: number;
  remaining: number;
  history: { kind: string; at: Date }[];
}) {
  const [off, setOff] = useState(disabled);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const next = !off;
    startTransition(async () => {
      const result = await setRemindersAction({
        engagementId,
        disabled: next,
      });
      if (result.ok) {
        setOff(next);
        setMessage(null);
      } else {
        setMessage(result.message);
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-(--color-body)">
        {sent} of 3 sent
        {off
          ? " · reminders are off for this client"
          : remaining === 0
            ? " · no more will go out"
            : ` · ${remaining} left`}
      </p>

      {history.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {history.map((entry) => (
            <li key={entry.kind} className="text-xs text-(--color-dim)">
              {KIND_LABELS[entry.kind] ?? entry.kind} — {WHEN.format(entry.at)}
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        disabled={pending}
        onClick={toggle}
        className="min-h-[44px] w-fit rounded-(--radius) border border-(--color-line-strong) px-3 text-sm text-(--color-ink) disabled:opacity-60"
      >
        {off ? "Turn reminders back on" : "Stop reminders for this client"}
      </button>

      {message ? (
        <p role="alert" className="text-sm text-(--color-c2)">
          {message}
        </p>
      ) : null}
    </div>
  );
}
