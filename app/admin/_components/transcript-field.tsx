"use client";

import { useRef, useState, useTransition } from "react";
import { saveTranscriptAction } from "@/app/admin/(protected)/queue/_actions/queue";

/**
 * A transcript, pasted in whenever it's ready.
 *
 * Most calls will never have one — this is opt-in, not part of the normal
 * flow — so it starts collapsed behind a quiet link unless a transcript
 * already exists, matching the admin surface's plain, nothing-shouting-for-
 * attention register (D-CRM-16). Autosaves on blur, same contract as notes:
 * a failed save keeps the text exactly where it was typed and only the claim
 * of being saved is withdrawn.
 *
 * One component, two homes: call mode renders it once the disposition is
 * logged, and the lead record renders one per attempt in the timeline — a
 * transcript belongs to the specific dial, not the lead, so it can
 * accumulate across calls instead of overwriting itself.
 */
export function TranscriptField({
  attemptId,
  leadId,
  initialValue,
}: {
  attemptId: string;
  leadId: string;
  initialValue: string;
}) {
  const [open, setOpen] = useState(Boolean(initialValue));
  const [value, setValue] = useState(initialValue);
  const [state, setState] = useState<"idle" | "saving" | "failed">("idle");
  const [, startTransition] = useTransition();
  const saved = useRef(initialValue);

  const persist = () => {
    if (value === saved.current) return;
    setState("saving");

    startTransition(async () => {
      const result = await saveTranscriptAction({
        attemptId,
        leadId,
        transcript: value,
      });
      if (result.ok) {
        saved.current = value;
        setState("idle");
      } else {
        setState("failed");
      }
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-[44px] w-fit px-2 text-sm text-(--color-dim) underline"
      >
        Add a transcript
      </button>
    );
  }

  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-2 text-xs text-(--color-dim)">
        Transcript
        {state === "saving" ? <span>saving…</span> : null}
        {state === "failed" ? (
          <span className="text-(--color-c2)">
            not saved — it&rsquo;s still here, try again
          </span>
        ) : null}
      </span>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={persist}
        rows={value ? 8 : 3}
        placeholder="Paste a transcript here if you recorded this call — speaker phone plus a transcription tool works well."
        data-typing
        className="rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 py-2 text-sm leading-relaxed text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
      />
    </label>
  );
}
