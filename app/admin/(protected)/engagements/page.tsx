import Link from "next/link";
import { money } from "@/app/admin/_components/engagement-state";
import { adminRoutes } from "@/lib/routes";
import { requireAdmin } from "@/server/services/admin-auth";
import {
  loadEngagementSummaries,
  loadMoneyTotals,
} from "@/server/services/engagement-admin";

export const dynamic = "force-dynamic";

const WHEN = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Vancouver",
  dateStyle: "medium",
});

const STATUS_LABELS: Record<string, string> = {
  created: "Link created",
  sent: "Link sent",
  paid: "Deposit paid",
  waived: "Waived",
  started: "Started",
  in_progress: "In progress",
  abandoned: "Stalled",
  complete: "Complete",
};

export default async function EngagementsPage() {
  await requireAdmin();

  const summaries = await loadEngagementSummaries();
  const totals = await loadMoneyTotals(summaries.map((s) => s.id));

  const paidTotal = [...totals.values()].reduce(
    (sum, entry) => sum + entry.paidCents,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-(family-name:--font-display) text-xl text-(--color-ink)">
          Engagements
        </h1>
        <p className="text-sm text-(--color-body)">
          {summaries.length} {summaries.length === 1 ? "client" : "clients"} ·{" "}
          {money(paidTotal)} collected
        </p>
      </header>

      {summaries.length === 0 ? (
        <p className="text-sm text-(--color-dim)">
          None yet. They start from a lead&rsquo;s page, or when a client fills
          in the public intake form themselves.
        </p>
      ) : (
        <ul className="flex flex-col">
          {summaries.map((summary) => (
            <li key={summary.id}>
              <Link
                href={adminRoutes.engagement(summary.id)}
                className="flex min-h-[44px] flex-wrap items-center gap-x-3 gap-y-1 border-l-2 border-transparent px-3 py-2 hover:border-(--color-c2) hover:bg-(--color-tint)/60"
              >
                <span className="text-sm text-(--color-ink)">
                  {summary.businessName}
                </span>
                <span className="text-xs text-(--color-dim)">
                  {summary.contactName}
                </span>

                <span className="ml-auto flex items-center gap-3">
                  {summary.remindersDisabled ? (
                    <span className="text-xs text-(--color-dim)">
                      reminders off
                    </span>
                  ) : null}

                  <span className="text-xs text-(--color-body)">
                    {summary.completedAt
                      ? `finished ${WHEN.format(summary.completedAt)}`
                      : `step ${summary.currentStep} of ${summary.totalSteps}`}
                  </span>

                  <span className="text-xs text-(--color-ink)">
                    {money(totals.get(summary.id)?.paidCents ?? 0)}
                  </span>

                  <span className="text-xs text-(--color-c2)">
                    {STATUS_LABELS[summary.status] ?? summary.status}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
