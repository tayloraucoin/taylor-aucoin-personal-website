import type { NextRequest } from "next/server";
import { parseTranscriptFilters } from "@/lib/validators/crm";
import { requireAdmin } from "@/server/services/admin-auth";
import {
  loadTranscripts,
  resolveTranscriptRange,
  toCsv,
  toExportRecord,
  transcriptRangeLabel,
} from "@/server/services/transcripts";

export async function GET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const filters = parseTranscriptFilters(
    Object.fromEntries(searchParams.entries()),
  );
  const range = resolveTranscriptRange(filters);
  const { rows } = await loadTranscripts(range);
  const format = searchParams.get("format") === "json" ? "json" : "csv";
  const filename = `transcripts-${transcriptRangeLabel(filters)}.${format}`;
  const records = rows.map(toExportRecord);

  if (format === "json") {
    return new Response(JSON.stringify(records, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  return new Response(toCsv(records), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
