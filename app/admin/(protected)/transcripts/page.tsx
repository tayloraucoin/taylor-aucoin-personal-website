import Link from "next/link";
import { TranscriptList } from "@/app/admin/_components/transcript-list";
import { TRANSCRIPT_PAGE } from "@/lib/crm/constants";
import {
  vancouverDayBounds,
  vancouverIsoDate,
} from "@/lib/crm/call-windows";
import { adminRoutes } from "@/lib/routes";
import {
  parseTranscriptFilters,
  transcriptsExportHref,
  transcriptsHref,
  type TranscriptFilters,
} from "@/lib/validators/crm";
import { requireAdmin } from "@/server/services/admin-auth";
import {
  loadTranscripts,
  resolveTranscriptRange,
} from "@/server/services/transcripts";

export const dynamic = "force-dynamic";

const EXPORT_BASE = `${adminRoutes.transcripts}/export`;

function quickRanges(now: Date): {
  label: string;
  filters: TranscriptFilters;
}[] {
  const { startOfToday, startOfTomorrow } = vancouverDayBounds(now);
  const today = vancouverIsoDate(now);
  const weekStart = vancouverIsoDate(
    new Date(startOfTomorrow.getTime() - 7 * 86400000),
  );
  const monthStart = vancouverIsoDate(startOfToday).slice(0, 8) + "01";
  const thirtyStart = vancouverIsoDate(
    new Date(startOfTomorrow.getTime() - 30 * 86400000),
  );

  return [
    { label: "Lifetime", filters: {} },
    { label: "Last 7 days", filters: { from: weekStart, to: today } },
    { label: "Last 30 days", filters: { from: thirtyStart, to: today } },
    { label: "This month", filters: { from: monthStart, to: today } },
  ];
}

function rangeIsActive(
  current: TranscriptFilters,
  candidate: TranscriptFilters,
): boolean {
  return current.from === candidate.from && current.to === candidate.to;
}

export default async function TranscriptsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const filters = parseTranscriptFilters(params);
  const now = new Date();
  const range = resolveTranscriptRange(filters);
  const limit = filters.shown ?? TRANSCRIPT_PAGE;
  const { rows, total, shown } = await loadTranscripts(range, { limit });
  const ranges = quickRanges(now);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-(family-name:--font-display) text-xl text-(--color-ink)">
          Transcripts
        </h1>
        <p className="text-sm text-(--color-body)">
          Calls with a transcript, most recent first. Export the filtered set for
          analysis.
        </p>
      </header>

      <form
        action={adminRoutes.transcripts}
        className="flex flex-wrap items-end gap-3"
      >
        <label className="flex flex-col gap-1">
          <span className="text-xs text-(--color-dim)">From</span>
          <input
            type="date"
            name="from"
            defaultValue={filters.from ?? ""}
            className="min-h-[44px] rounded-(--radius) border border-white/15 bg-black/30 px-3 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-(--color-dim)">To</span>
          <input
            type="date"
            name="to"
            defaultValue={filters.to ?? ""}
            className="min-h-[44px] rounded-(--radius) border border-white/15 bg-black/30 px-3 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
          />
        </label>
        <button
          type="submit"
          className="min-h-[44px] rounded-(--radius) border border-white/20 px-4 text-sm text-(--color-ink)"
        >
          Apply
        </button>
      </form>

      <section className="flex flex-wrap gap-2">
        {ranges.map((entry) => (
          <Link
            key={entry.label}
            href={transcriptsHref(adminRoutes.transcripts, entry.filters)}
            aria-pressed={rangeIsActive(filters, entry.filters)}
            className={`min-h-[44px] rounded-(--radius) border px-3 py-2.5 text-sm ${
              rangeIsActive(filters, entry.filters)
                ? "border-(--color-c2)/60 text-(--color-ink)"
                : "border-white/15 text-(--color-body) hover:text-(--color-ink)"
            }`}
          >
            {entry.label}
          </Link>
        ))}
      </section>

      <section className="flex flex-wrap gap-3">
        <a
          href={transcriptsExportHref(EXPORT_BASE, filters, "csv")}
          className="min-h-[44px] rounded-(--radius) border border-white/20 px-4 py-2.5 text-sm text-(--color-ink)"
        >
          Download CSV
        </a>
        <a
          href={transcriptsExportHref(EXPORT_BASE, filters, "json")}
          className="min-h-[44px] rounded-(--radius) border border-white/20 px-4 py-2.5 text-sm text-(--color-ink)"
        >
          Download JSON
        </a>
      </section>

      <TranscriptList
        rows={rows}
        total={total}
        shown={shown}
        filters={filters}
      />
    </div>
  );
}
