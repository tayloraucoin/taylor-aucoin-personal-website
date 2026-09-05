import type { CallWindow } from "@/lib/crm/call-windows";
import type { LeadStage } from "@/lib/types/crm";

/**
 * The small labels that carry the queue's state.
 *
 * No colored status dots anywhere (D-CRM-22): traffic-light semantics would
 * turn "this trade is hard to reach right now" into an alarm, and an overdue
 * callback into a failure. Gold is the only accent used, and only where
 * something genuinely wants attention.
 */

const STAGE_LABELS: Record<LeadStage, string> = {
  to_call: "To call",
  trying: "Trying",
  in_conversation: "In conversation",
  info_sent: "Info sent",
  intake_sent: "Intake sent",
  client: "Client",
  not_now: "Not now",
  not_interested: "Not interested",
  do_not_call: "Do not call",
  bad_lead: "Bad lead",
};

export function StageChip({ stage }: { stage: LeadStage }) {
  return (
    <span className="rounded-(--radius) border border-(--color-line) px-1.5 py-0.5 text-xs text-(--color-dim)">
      {STAGE_LABELS[stage]}
    </span>
  );
}

/**
 * When this trade is reachable. Text, never a dot — and never a countdown:
 * "best 4:30pm" is a fact, "closing in 12 minutes" is pressure.
 */
export function WindowChip({ window }: { window: CallWindow }) {
  const good = window.isOpenNow && window.tier === "best";

  return (
    <span
      className={
        good ? "text-xs text-(--color-c2)" : "text-xs text-(--color-dim)"
      }
    >
      {window.label}
    </span>
  );
}
