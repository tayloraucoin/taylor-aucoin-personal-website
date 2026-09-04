import Link from "next/link";
import { DISPOSITION_LABELS, TRANSCRIPT_PAGE } from "@/lib/crm/constants";
import { adminRoutes } from "@/lib/routes";
import { transcriptsHref, type TranscriptFilters } from "@/lib/validators/crm";
import type { TranscriptRow } from "@/server/services/transcripts";

const WHEN = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Vancouver",
  dateStyle: "medium",
  timeStyle: "short",
});

export function TranscriptList({
  rows,
  total,
  shown,
  filters,
}: {
  rows: TranscriptRow[];
  total: number;
  shown: number;
  filters: TranscriptFilters;
}) {
  if (rows.length === 0) {
    return (
      <div className="flex max-w-prose flex-col gap-3 border-t border-(--color-line-soft) pt-6">
        <p className="text-sm text-(--color-ink)">
          No transcripts in this range yet.
        </p>
        <Link
          href={adminRoutes.transcripts}
          className="text-sm text-(--color-c2) underline"
        >
          Clear date range
        </Link>
      </div>
    );
  }

  const more = total > shown;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-(--color-dim)">
        {total === shown
          ? `Showing ${shown} transcript${shown === 1 ? "" : "s"}`
          : `Showing ${shown} of ${total} transcripts`}
      </p>

      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <li
            key={row.attemptId}
            className="border-l-2 border-(--color-line-soft) px-3 py-2 hover:border-(--color-c2)"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <Link
                href={adminRoutes.lead(row.leadId)}
                className="text-sm text-(--color-ink) underline"
              >
                {row.businessName}
              </Link>
              <span className="text-xs text-(--color-dim)">
                {row.niche} · {row.city}
              </span>
              <span className="text-xs text-(--color-body)">
                {WHEN.format(row.at)}
              </span>
              <span className="text-xs text-(--color-dim)">
                {DISPOSITION_LABELS[row.disposition]}
              </span>
            </div>

            {row.note ? (
              <p className="mt-1 text-xs text-(--color-body)">{row.note}</p>
            ) : null}

            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-(--color-dim) underline">
                Read transcript
              </summary>
              <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-(--radius) border border-(--color-line-soft) bg-(--color-well) p-3 text-sm leading-relaxed text-(--color-ink)">
                {row.transcript}
              </pre>
            </details>
          </li>
        ))}
      </ul>

      {more ? (
        <Link
          href={transcriptsHref(adminRoutes.transcripts, filters, {
            shown: shown + TRANSCRIPT_PAGE,
          })}
          className="min-h-[44px] self-start px-3 py-2.5 text-sm text-(--color-c2) underline"
        >
          Show {TRANSCRIPT_PAGE} more
        </Link>
      ) : null}
    </div>
  );
}
