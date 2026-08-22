import type {
  EngagementSummary,
  MoneyLine,
} from "@/server/services/engagement-admin";

/**
 * Where a client is and what they have paid.
 *
 * Shared by the lead's engagement panel and the engagement page itself, so the
 * two can never disagree about a client's state — which matters most for the
 * money, where a discrepancy between two screens is a support call.
 */

const STATUS_LABELS: Record<string, string> = {
  created: "Link created",
  sent: "Link sent",
  paid: "Deposit paid",
  waived: "Deposit waived",
  started: "Started",
  in_progress: "In progress",
  abandoned: "Stalled",
  complete: "Complete",
};

const WHEN = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Vancouver",
  dateStyle: "medium",
});

export const money = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-CA", { minimumFractionDigits: 2 })}`;

export function EngagementState({ summary }: { summary: EngagementSummary }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm text-(--color-ink)">
        {STATUS_LABELS[summary.status] ?? summary.status}
        {/* "Stalled" is derived from inactivity, so it says why rather than
            reading as a judgment about the client. */}
        {summary.status === "abandoned" && summary.lastActivityAt
          ? ` — nothing since ${WHEN.format(summary.lastActivityAt)}`
          : ""}
      </p>

      <p className="text-sm text-(--color-body)">
        {summary.paidAt
          ? `Deposit paid ${WHEN.format(summary.paidAt)}`
          : summary.depositRequired
            ? "Deposit not paid yet"
            : "Deposit waived"}
      </p>

      {summary.completedAt ? (
        <p className="text-sm text-(--color-body)">
          Questionnaire finished {WHEN.format(summary.completedAt)}
        </p>
      ) : (
        <p className="text-sm text-(--color-body)">
          Questionnaire step {summary.currentStep} of {summary.totalSteps}
        </p>
      )}
    </div>
  );
}

export function MoneyTable({
  lines,
  paidCents,
  pendingCents,
}: {
  lines: MoneyLine[];
  paidCents: number;
  pendingCents: number;
}) {
  if (lines.length === 0) {
    return (
      <p className="text-sm text-(--color-dim)">
        Nothing charged yet. Lines appear when a checkout is started.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-1">
        {lines.map((line) => (
          <li
            key={`${line.name}-${line.amountCents}`}
            className="flex flex-wrap items-baseline gap-x-3 text-sm"
          >
            <span className="text-(--color-body)">
              {line.name}
              {line.quantity > 1 ? ` × ${line.quantity}` : ""}
            </span>
            <span className="ml-auto text-(--color-ink)">
              {money(line.amountCents * line.quantity)}
            </span>
            <span className="w-20 text-right text-xs text-(--color-dim)">
              {line.paidAt ? "paid" : "unpaid"}
            </span>
          </li>
        ))}
      </ul>

      <p className="border-t border-white/10 pt-2 text-sm text-(--color-ink)">
        {money(paidCents)} paid
        {pendingCents > 0 ? ` · ${money(pendingCents)} outstanding` : ""}
      </p>
    </div>
  );
}
