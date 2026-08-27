"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  adjustFollowUpAction,
  logAttemptAction,
  saveNotesAction,
} from "@/app/admin/(protected)/queue/_actions/queue";
import { DISPOSITION_LABELS, DISPOSITION_ORDER, CALLBACK_CHIPS } from "@/lib/crm/constants";
import { startOfNextHour, toDatetimeLocalValue } from "@/lib/crm/datetime-local";
import { adminRoutes } from "@/lib/routes";
import type { CallDisposition } from "@/lib/types/crm";
import type { ScheduleToken } from "@/server/services/calls";
import type { QueueLead } from "@/server/services/leads";
import { CallReview, type ReviewSummary } from "./call-review";
import { ConversationForm, type ConversationValues } from "./conversation-form";
import { hasModifier, isTypingTarget } from "./keyboard";
import { LeadAdvisories, LeadFacts, PhoneBlock } from "./lead-facts";
import { PostCallPanel, type CompletedAction } from "./post-call-panel";
import { TranscriptField } from "./transcript-field";

/**
 * The right column, across every phase of a call.
 *
 * **A logged outcome is never lost.** A failed save keeps the exact payload
 * on screen with a retry that resends it verbatim; nothing is discarded and
 * no lead silently leaves the queue unlogged.
 *
 * **Nothing beyond the disposition is ever required** (D-CRM-8) — that holds
 * on the conversation path too, where every field is optional and Save with
 * only the disposition is a complete call.
 */

/** Where a call is, from picking up the phone to moving on. */
export type CallPhase =
  /** State 0 — facts and the number, nothing logged, nothing dialed. */
  | { kind: "precall" }
  /** State 1 — dialing. The disposition row is live; nothing is logged yet. */
  | { kind: "dialing" }
  /** State 2b — the conversation fields are open, not yet committed. */
  | { kind: "conversation" }
  /** Do-not-call, held for its one confirm. Permanent, so never on a click. */
  | { kind: "confirmingDnc" }
  /** State 2a — a non-conversation attempt exists; chips refine it. */
  | { kind: "logged"; disposition: CallDisposition; attemptId: string }
  /** State 3 — a conversation was saved and still owes something. */
  | {
      kind: "postcall";
      attemptId: string;
      owed: { info: boolean; intake: boolean };
      summary: ReviewSummary;
    }
  /** State 4 — the receipt. Conversations only (D-CRM-27). */
  | {
      kind: "review";
      attemptId: string;
      summary: ReviewSummary;
      completed: CompletedAction[];
    };

type Payload = Parameters<typeof logAttemptAction>[0];

const RETRY_CHIPS: { token: ScheduleToken; label: string }[] = [
  { token: "in_30_min", label: "In 30 min" },
  { token: "today_early_afternoon", label: "Today early afternoon" },
  { token: "today_late_afternoon", label: "Today late afternoon" },
  { token: "today_early_evening", label: "Today early evening" },
  { token: "tomorrow_am", label: "Tomorrow AM" },
  { token: "in_2_days", label: "In 2 days" },
  { token: "next_week", label: "Next week" },
];

const NOT_INTERESTED_REASONS = ["Has a guy", "No need", "Money", "Timing"];

/**
 * What a conversation still owes, derived from what it captured.
 *
 * Both can be true at once — "send me the info and let's get started" is one
 * sentence a prospect actually says — so this is two flags rather than a
 * winner.
 */
function owedFor(tags: ConversationValues["interestTags"]) {
  return {
    info: tags.includes("wants_info"),
    intake: tags.includes("ready_for_intake"),
  };
}

export function CallPanel({
  lead,
  phase,
  sheetOpen,
  onPhase,
  onHold,
  onAdvance,
}: {
  lead: QueueLead;
  phase: CallPhase;
  /** The lead-record Sheet is open over this panel — keys go inert (CRM-13). */
  sheetOpen: boolean;
  onPhase: (next: CallPhase) => void;
  /** Pin this call so revalidation cannot pull the lead out from under it. */
  onHold: (lead: QueueLead) => void;
  /** Release it and move to the next lead. */
  onAdvance: (leadId: string) => void;
}) {
  const [notes, setNotes] = useState(lead.notes);
  const [noteState, setNoteState] = useState<"idle" | "saving" | "failed">(
    "idle",
  );
  /**
   * A transcript already in hand by the time the call is being logged.
   *
   * Unlike Notes, this has no lead-level home to autosave to — a transcript
   * belongs to one specific dial, not the lead (it accumulates across calls
   * rather than overwriting itself), and there is no attempt row to attach
   * it to until the disposition commits. So it behaves like `note`, not like
   * Notes: typed here, carried in the Save payload, written into the same
   * row as the disposition. If nothing was typed before Save, or more shows
   * up afterward, the attempt-scoped `TranscriptField` (rendered once an
   * attemptId exists) takes over — same underlying column, later write.
   */
  const [transcript, setTranscript] = useState("");
  const [failure, setFailure] = useState<{
    payload: Payload;
    message: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const savedNotes = useRef(lead.notes);
  /**
   * Where a retry should land.
   *
   * A failed save keeps the exact payload *and* the exact destination: a
   * conversation that failed once must still reach its post-call panel when
   * it succeeds, not fall through to the non-conversation chips.
   */
  const retryReview = useRef<ReviewSummary | null>(null);

  // A different lead means a different call: reset every transient piece so a
  // half-finished disposition can never be attributed to the wrong business.
  useEffect(() => {
    setNotes(lead.notes);
    savedNotes.current = lead.notes;
    setNoteState("idle");
    setTranscript("");
    setFailure(null);
    retryReview.current = null;
  }, [lead.id, lead.notes]);

  /**
   * Commit the call, then route by what it produced.
   *
   * A non-conversation lands on the chips. A conversation lands on the
   * post-call panel when something is owed, and straight on the receipt when
   * nothing is — a review screen is worth showing for a conversation either
   * way (it confirms the date just committed), but never for a no-answer.
   */
  const submit = (payload: Payload, review: ReviewSummary | null) => {
    retryReview.current = review;

    startTransition(async () => {
      try {
        const result = await logAttemptAction(payload);

        if (result.ok) {
          setFailure(null);
          // Pin before revalidation lands, or the list drops this lead and
          // takes the panel with it mid-follow-up.
          onHold(lead);

          if (!review) {
            onPhase({
              kind: "logged",
              disposition: payload.disposition,
              attemptId: result.attemptId,
            });
            return;
          }

          // The committed date comes back from the write, so the receipt
          // reports what the database actually holds rather than restating
          // what was asked for.
          const summary = { ...review, nextActionAt: result.nextActionAt };
          const owed = owedFor(review.interestTags);

          onPhase(
            owed.info || owed.intake
              ? {
                  kind: "postcall",
                  attemptId: result.attemptId,
                  owed,
                  summary,
                }
              : {
                  kind: "review",
                  attemptId: result.attemptId,
                  summary,
                  completed: [],
                },
          );
        } else {
          // Keep the exact payload so one click retries it verbatim.
          setFailure({ payload, message: result.message });
        }
      } catch {
        // A thrown server action becomes Next's `undefined.call` overlay,
        // which hides the form. Keep the payload so Retry still works.
        setFailure({
          payload,
          message: "Couldn't save that call. Try again.",
        });
      }
    });
  };

  const onDisposition = (disposition: CallDisposition) => {
    setFailure(null);

    // The one exception to logging on the click. Do-not-call is permanent and
    // overrides every filter forever, so it asks first (§3.2).
    if (disposition === "do_not_call") return onPhase({ kind: "confirmingDnc" });
    if (disposition === "conversation") return onPhase({ kind: "conversation" });

    submit(
      {
        leadId: lead.id,
        disposition,
        note: notes || undefined,
        transcript: transcript || undefined,
      },
      null,
    );
  };

  // The listener needs the current handler without re-binding every keystroke.
  const dispositionRef = useRef(onDisposition);
  dispositionRef.current = onDisposition;

  /**
   * Number keys mirror the disposition row, and Enter advances a finished
   * call. Both are inert wherever a keystroke could log twice or act on the
   * wrong thing: while typing, under a modifier, while a save is in flight,
   * while the record Sheet is open over the panel, and in every phase that
   * does not own the key.
   */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (hasModifier(event) || isTypingTarget(event)) return;
      if (pending || sheetOpen) return;

      if (
        (phase.kind === "logged" || phase.kind === "review") &&
        event.key === "Enter"
      ) {
        event.preventDefault();
        onAdvance(lead.id);
        return;
      }

      if (phase.kind !== "dialing") return;

      const index = Number(event.key) - 1;
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= DISPOSITION_ORDER.length
      ) {
        return;
      }

      event.preventDefault();
      dispositionRef.current(DISPOSITION_ORDER[index]!);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, pending, sheetOpen, lead.id, onAdvance]);

  const persistNotes = () => {
    if (notes === savedNotes.current) return;
    setNoteState("saving");

    startTransition(async () => {
      const result = await saveNotesAction({ leadId: lead.id, notes });
      if (result.ok) {
        savedNotes.current = notes;
        setNoteState("idle");
      } else {
        // The text stays in the box; only the claim of being saved is dropped.
        setNoteState("failed");
      }
    });
  };

  const adjust = (input: Parameters<typeof adjustFollowUpAction>[0]) => {
    startTransition(async () => {
      try {
        await adjustFollowUpAction(input);
      } catch {
        // Chip clicks must not take down the logged panel.
      }
    });
  };

  // Once an attempt exists, the transcript field hands off to the
  // attempt-scoped, autosaving version — same column, later write, seeded
  // with whatever was already typed so it never looks like it vanished.
  const loggedAttemptId =
    phase.kind === "logged" || phase.kind === "postcall" || phase.kind === "review"
      ? phase.attemptId
      : null;

  return (
    <section
      aria-label={`Call ${lead.businessName}`}
      className="flex flex-col gap-5"
    >
      <LeadFacts lead={lead}>
        {phase.kind === "precall" ? (
          <Link
            href={`${adminRoutes.queue}?lead=${lead.id}`}
            scroll={false}
            className="text-xs text-(--color-dim) underline"
          >
            Full record
          </Link>
        ) : null}
      </LeadFacts>

      <PhoneBlock phone={lead.phone}>
        {phase.kind === "precall" ? (
          <button
            type="button"
            onClick={() => onPhase({ kind: "dialing" })}
            className="min-h-[44px] rounded-(--radius) bg-(--color-action) px-4 text-sm font-medium text-white"
          >
            Call now
          </button>
        ) : null}
      </PhoneBlock>

      <LeadAdvisories
        lead={lead}
        showSeasonal={phase.kind === "precall"}
      />

      <label className="flex flex-col gap-2">
        <span className="flex items-center gap-2 text-sm text-(--color-body)">
          Notes
          {noteState === "saving" ? (
            <span className="text-xs text-(--color-dim)">saving…</span>
          ) : null}
          {noteState === "failed" ? (
            <span className="text-xs text-(--color-c2)">
              not saved — it&rsquo;s still here, try again
            </span>
          ) : null}
        </span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          onBlur={persistNotes}
          rows={4}
          data-typing
          className="rounded-(--radius) border border-white/15 bg-black/30 px-3 py-2 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
        />
      </label>

      {phase.kind === "precall" ? null : loggedAttemptId ? (
        <TranscriptField
          key={loggedAttemptId}
          attemptId={loggedAttemptId}
          leadId={lead.id}
          initialValue={transcript}
        />
      ) : (
        <label className="flex flex-col gap-2">
          <span className="text-sm text-(--color-body)">Transcript</span>
          <textarea
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            rows={transcript ? 8 : 3}
            placeholder="Paste a transcript here if you recorded this call — speaker phone plus a transcription tool works well."
            data-typing
            className="rounded-(--radius) border border-white/15 bg-black/30 px-3 py-2 text-sm leading-relaxed text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
          />
        </label>
      )}

      {failure ? (
        <div role="alert" className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-(--color-c2)">{failure.message}</p>
          <button
            type="button"
            disabled={pending}
            onClick={() => submit(failure.payload, retryReview.current)}
            className="min-h-[44px] rounded-(--radius) border border-(--color-c2)/50 px-3 text-sm text-(--color-ink)"
          >
            Retry
          </button>
        </div>
      ) : null}

      {phase.kind === "precall" ? (
        <p className="text-xs text-(--color-dim)">
          Press Call now to bring up the script and log the outcome.
        </p>
      ) : null}

      {phase.kind === "dialing" ? (
        <DispositionRow
          disabled={pending}
          onPick={onDisposition}
          onBack={() => onPhase({ kind: "precall" })}
        />
      ) : null}

      {phase.kind === "confirmingDnc" ? (
        <ConfirmDnc
          disabled={pending}
          onConfirm={() =>
            submit(
              {
                leadId: lead.id,
                disposition: "do_not_call",
                note: notes || undefined,
                transcript: transcript || undefined,
              },
              null,
            )
          }
          onCancel={() => onPhase({ kind: "dialing" })}
        />
      ) : null}

      {phase.kind === "conversation" ? (
        <ConversationForm
          lead={lead}
          disabled={pending}
          onBack={() => onPhase({ kind: "dialing" })}
          onSave={(values) =>
            submit(
              {
                leadId: lead.id,
                disposition: "conversation",
                interestTags: values.interestTags,
                note: notes || undefined,
                transcript: transcript || undefined,
                contactName: values.contactName,
                contactEmail: values.contactEmail,
                phoneOverride: values.phoneOverride,
                preferredChannel: values.preferredChannel ?? undefined,
                schedule: values.schedule ?? undefined,
                nextActionAt: values.nextActionAt ?? undefined,
              },
              {
                contactName: values.contactName,
                contactEmail: values.contactEmail,
                phoneOverride: values.phoneOverride,
                preferredChannel: values.preferredChannel,
                interestTags: values.interestTags,
                // Replaced with the committed date once the write returns.
                nextActionAt: null,
                notes,
              },
            )
          }
        />
      ) : null}

      {phase.kind === "logged" ? (
        <LoggedPanel
          lead={lead}
          phase={phase}
          disabled={pending}
          onAdjust={adjust}
          onAdvance={() => onAdvance(lead.id)}
        />
      ) : null}

      {phase.kind === "postcall" ? (
        <PostCallPanel
          lead={lead}
          attemptId={phase.attemptId}
          owed={phase.owed}
          channel={phase.summary.preferredChannel}
          capturedEmail={phase.summary.contactEmail}
          forDecisionMaker={phase.summary.interestTags.includes("decision_maker")}
          onDone={(completed) =>
            onPhase({
              kind: "review",
              attemptId: phase.attemptId,
              summary: phase.summary,
              completed,
            })
          }
        />
      ) : null}

      {phase.kind === "review" ? (
        <CallReview
          lead={lead}
          summary={phase.summary}
          completed={phase.completed}
          onAdvance={() => onAdvance(lead.id)}
        />
      ) : null}
    </section>
  );
}

function DispositionRow({
  disabled,
  onPick,
  onBack,
}: {
  disabled: boolean;
  onPick: (disposition: CallDisposition) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-(--color-dim)">
        How did it go? Number keys work too.
      </p>
      <div className="flex flex-wrap gap-2">
        {DISPOSITION_ORDER.map((disposition, index) => (
          <button
            key={disposition}
            type="button"
            disabled={disabled}
            onClick={() => onPick(disposition)}
            className="min-h-[44px] rounded-(--radius) border border-white/20 px-3 text-sm text-(--color-ink) hover:border-(--color-c2)/60 disabled:opacity-50"
          >
            <span className="mr-1.5 text-xs text-(--color-dim)">
              {index + 1}
            </span>
            {DISPOSITION_LABELS[disposition]}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onBack}
        className="min-h-[44px] w-fit px-2 text-sm text-(--color-dim) underline"
      >
        Back — nothing logged
      </button>
    </div>
  );
}

/** Permanent, and the one exclusion nothing overrides. So it asks first. */
function ConfirmDnc({
  disabled,
  onConfirm,
  onCancel,
}: {
  disabled: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-(--radius) border border-(--color-c2)/40 p-4">
      <p className="text-sm text-(--color-ink)">
        Mark do not call? This is permanent — they never appear in a queue
        again, and no filter or import brings them back.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={onConfirm}
          className="min-h-[44px] rounded-(--radius) border border-(--color-c2)/50 px-4 text-sm text-(--color-ink) disabled:opacity-50"
        >
          Yes, do not call
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[44px] px-2 text-sm text-(--color-dim) underline"
        >
          Never mind
        </button>
      </div>
    </div>
  );
}

/**
 * The call is logged. What is left is refinement and moving on.
 *
 * Everything here is optional: the cadence already gave this lead a next
 * action (D-CRM-4), so the chips adjust a date that already exists rather
 * than supplying a missing one. Next lead is always one click away.
 */
function LoggedPanel({
  lead,
  phase,
  disabled,
  onAdjust,
  onAdvance,
}: {
  lead: QueueLead;
  phase: Extract<CallPhase, { kind: "logged" }>;
  disabled: boolean;
  onAdjust: (input: {
    leadId: string;
    schedule?: ScheduleToken;
    nextActionAt?: Date;
    closedReason?: string;
  }) => void;
  onAdvance: () => void;
}) {
  const [adjusted, setAdjusted] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [pickedAt, setPickedAt] = useState("");

  const scheduleChips =
    phase.disposition === "busy_callback"
      ? CALLBACK_CHIPS
      : phase.disposition === "no_answer" ||
          phase.disposition === "voicemail" ||
          phase.disposition === "hung_up"
        ? RETRY_CHIPS
        : [];

  const reasons =
    phase.disposition === "not_interested" ? NOT_INTERESTED_REASONS : [];

  const applyPicked = (value: string) => {
    if (!value) return;
    onAdjust({ leadId: lead.id, nextActionAt: new Date(value) });
    setAdjusted("at the time you picked");
  };

  const field =
    "min-h-[44px] rounded-(--radius) border border-white/15 bg-black/30 px-3 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-c2)";

  const chip = (active: boolean) =>
    `min-h-[44px] rounded-(--radius) border px-3 text-sm disabled:opacity-50 ${
      active
        ? "border-(--color-c2)/60 bg-white/5 text-(--color-ink)"
        : "border-white/20 text-(--color-ink) hover:border-(--color-c2)/60"
    }`;

  return (
    <div className="flex flex-col gap-3 rounded-(--radius) border border-(--color-c2)/40 p-4">
      <p className="text-sm text-(--color-ink)">
        Logged: {DISPOSITION_LABELS[phase.disposition].toLowerCase()}.
      </p>

      {scheduleChips.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-(--color-dim)">
            {adjusted
              ? `Coming back ${adjusted.toLowerCase()}.`
              : "Scheduled automatically. Change it if they said otherwise."}
          </p>
          <div className="flex flex-wrap gap-2">
            {scheduleChips.map((option) => (
              <button
                key={option.token}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setPicking(false);
                  onAdjust({ leadId: lead.id, schedule: option.token });
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
              disabled={disabled}
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
        </div>
      ) : null}

      {reasons.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-(--color-dim)">
            {adjusted ? `Noted: ${adjusted.toLowerCase()}.` : "Why not?"}
          </p>
          <div className="flex flex-wrap gap-2">
            {reasons.map((reason) => (
              <button
                key={reason}
                type="button"
                disabled={disabled}
                onClick={() => {
                  onAdjust({ leadId: lead.id, closedReason: reason });
                  setAdjusted(reason);
                }}
                aria-pressed={adjusted === reason}
                className={`min-h-[44px] rounded-(--radius) border px-3 text-sm disabled:opacity-50 ${
                  adjusted === reason
                    ? "border-(--color-c2)/60 bg-white/5 text-(--color-ink)"
                    : "border-white/20 text-(--color-ink) hover:border-(--color-c2)/60"
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onAdvance}
          className="min-h-[44px] rounded-(--radius) bg-(--color-action) px-4 text-sm font-medium text-white"
        >
          Next lead
        </button>
        <span className="text-xs text-(--color-dim)">Enter works too.</span>
      </div>
    </div>
  );
}
