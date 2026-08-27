import Link from "next/link";
import { StageChip } from "@/app/admin/_components/chips";
import { LEAD_PRESETS } from "@/lib/crm/constants";
import { adminRoutes } from "@/lib/routes";
import { leadsHref, type LeadFilters } from "@/lib/validators/crm";
import type { LeadWorkspace } from "@/server/services/lead-workspace";

/**
 * The lookup list.
 *
 * A server component: nothing here is interactive beyond links, and the rows
 * carry dates that must be formatted against Vancouver's clock rather than
 * whatever the browser is set to — the same reasoning the queue renders
 * against a server-computed `now` (D-CRM-17).
 *
 * Rows show the phone number, which the board deliberately will not: one row
 * per line reached by a search you ran on purpose is a different exposure from
 * sixty cards at a glance.
 */

const WHEN = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Vancouver",
  dateStyle: "medium",
  timeStyle: "short",
});

const DAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Vancouver",
  dateStyle: "medium",
});

/**
 * How long since the last dial or intro email, stated plainly.
 *
 * Never a color, never a badge, never a count that climbs (D-CRM-33). A lead
 * that has gone quiet is a warm lead with a gap in it, and the copy says the
 * gap rather than sounding an alarm about it.
 */
function sinceTouch(at: Date | null, now: Date): string {
  if (at === null) return "never called";

  const days = Math.floor((now.getTime() - at.getTime()) / 86400000);
  if (days <= 0) return "touched today";
  if (days === 1) return "touched yesterday";
  return `touched ${days} days ago`;
}

function nextActionLabel(at: Date | null, now: Date): string {
  if (at === null) return "no next action";
  return at < now ? `${DAY.format(at)} — past` : WHEN.format(at);
}

export function LeadList({
  workspace,
  filters,
  now,
  clearHref,
}: {
  workspace: LeadWorkspace;
  filters: LeadFilters;
  now: Date;
  clearHref: string;
}) {
  const { rows, total, allLeads, shown } = workspace;

  if (rows.length === 0) {
    return <EmptyList filters={filters} clearHref={clearHref} />;
  }

  const more = total > rows.length;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-(--color-dim)">
        {total === allLeads
          ? `Showing ${rows.length} of ${allLeads}`
          : `${total} of ${allLeads} match — showing ${rows.length}`}
      </p>

      <ul className="flex flex-col">
        {rows.map((row) => (
          <li key={row.id}>
            <Link
              href={rowHref(filters, row.id)}
              scroll={false}
              className="flex min-h-[44px] flex-wrap items-center gap-x-3 gap-y-1 border-l-2 border-transparent px-3 py-2 hover:border-(--color-c2) hover:bg-white/[0.03]"
            >
              <span className="text-sm text-(--color-ink)">
                {row.businessName}
              </span>
              <span className="text-xs text-(--color-dim)">
                {row.niche} · {row.city}
              </span>
              {row.rating !== null ? (
                <span className="text-xs text-(--color-body)">
                  {row.rating} × {row.reviews ?? 0}
                </span>
              ) : null}
              <StageChip stage={row.stage} />

              <span className="ml-auto flex flex-wrap items-center gap-3">
                <span className="text-xs text-(--color-dim)">
                  {sinceTouch(row.lastTouchAt, now)}
                </span>
                <span
                  className={
                    row.nextActionAt === null
                      ? "text-xs text-(--color-c2)"
                      : "text-xs text-(--color-body)"
                  }
                >
                  {nextActionLabel(row.nextActionAt, now)}
                </span>
                {row.hasEmail ? (
                  <span className="text-xs text-(--color-dim)">email</span>
                ) : null}
                <span className="font-(family-name:--font-mono) text-xs text-(--color-dim)">
                  {row.phone}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {more ? (
        <Link
          href={leadsHref(adminRoutes.leads, filters, { shown: shown + 50 })}
          className="min-h-[44px] self-start px-3 py-2.5 text-sm text-(--color-c2) underline"
        >
          Show 50 more
        </Link>
      ) : null}
    </div>
  );
}

/** A row link that keeps the whole filter state, so closing the drawer lands
 * back on the list you were reading rather than an unfiltered one. */
function rowHref(filters: LeadFilters, leadId: string): string {
  const base = leadsHref(adminRoutes.leads, filters);
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}lead=${leadId}`;
}

/**
 * Empty is a state, not a failure.
 *
 * It always names a way onward: clear the filters, or go where the leads
 * actually are. The one empty worth reading twice is a preset returning
 * nothing — for "Gone quiet" and "No next action", nothing is the good
 * outcome, and the copy says so flatly rather than congratulating anyone.
 */
function EmptyList({
  filters,
  clearHref,
}: {
  filters: LeadFilters;
  clearHref: string;
}) {
  const preset = LEAD_PRESETS.find((entry) => entry.token === filters.preset);

  const message =
    filters.preset === "gone_quiet"
      ? "Nothing has gone quiet. Everyone you've worked has a date."
      : filters.preset === "no_next_action"
        ? "Every worked lead is carrying a next action."
        : filters.preset === "wants_info_unsent"
          ? "Everyone who asked for the info has it."
          : preset
            ? `Nothing in ${preset.label.toLowerCase()} right now.`
            : filters.q
              ? `Nothing matched “${filters.q}”.`
              : "No leads match these filters.";

  return (
    <div className="flex max-w-prose flex-col gap-3 border-t border-white/10 pt-6">
      <p className="text-sm text-(--color-ink)">{message}</p>
      <div className="flex flex-wrap items-center gap-4">
        <Link href={clearHref} className="text-sm text-(--color-c2) underline">
          Clear filters
        </Link>
        <Link
          href={adminRoutes.queue}
          className="text-sm text-(--color-body) underline"
        >
          Go to the call queue
        </Link>
      </div>
    </div>
  );
}
