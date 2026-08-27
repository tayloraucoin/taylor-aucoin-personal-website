import { and, desc, eq, gte, isNotNull, lt, ne } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { getDb } from "@/db/client";
import { callAttempts } from "@/db/schema/call-attempts";
import { leads } from "@/db/schema/leads";
import { INTEREST_TAG_LABELS } from "@/lib/crm/constants";
import { vancouverMidnight } from "@/lib/crm/call-windows";
import type { CallDisposition, InterestTag } from "@/lib/types/crm";
import type { TranscriptFilters } from "@/lib/validators/crm";

export type TranscriptRow = {
  attemptId: string;
  at: Date;
  disposition: CallDisposition;
  interestTags: InterestTag[];
  linkTexted: boolean;
  note: string | null;
  transcript: string;
  leadId: string;
  businessName: string;
  niche: string;
  city: string;
  contactName: string | null;
  phone: string;
};

export type TranscriptExportRecord = {
  attempt_id: string;
  called_at_vancouver: string;
  called_at_iso: string;
  disposition: CallDisposition;
  business_name: string;
  category: string;
  city: string;
  contact_name: string | null;
  phone: string;
  link_texted: boolean;
  interest_tags: string[];
  note: string | null;
  transcript: string;
};

const VANCOUVER_WHEN = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Vancouver",
  dateStyle: "medium",
  timeStyle: "short",
});

/** Vancouver `YYYY-MM-DD` strings from filters → UTC instants for querying. */
export function resolveTranscriptRange(filters: TranscriptFilters): {
  from?: Date;
  /** Exclusive upper bound — start of the day after `to`. */
  toExclusive?: Date;
} {
  const range: { from?: Date; toExclusive?: Date } = {};

  if (filters.from) {
    range.from = vancouverMidnight(filters.from);
  }

  if (filters.to) {
    const [year, month, day] = filters.to.split("-").map(Number);
    const nextDay = new Date(Date.UTC(year!, month! - 1, day! + 1));
    range.toExclusive = vancouverMidnight(nextDay.toISOString().slice(0, 10));
  }

  return range;
}

function transcriptScope(
  range: ReturnType<typeof resolveTranscriptRange>,
): SQL | undefined {
  const clauses: SQL[] = [
    isNotNull(callAttempts.transcript),
    ne(callAttempts.transcript, ""),
  ];

  if (range.from) {
    clauses.push(gte(callAttempts.createdAt, range.from));
  }

  if (range.toExclusive) {
    clauses.push(lt(callAttempts.createdAt, range.toExclusive));
  }

  return and(...clauses);
}

export async function loadTranscripts(
  range: ReturnType<typeof resolveTranscriptRange>,
  opts?: { limit?: number },
): Promise<{ rows: TranscriptRow[]; total: number; shown: number }> {
  const db = getDb();
  const scope = transcriptScope(range);

  const [total, raw] = await Promise.all([
    db.$count(callAttempts, scope),
    db
      .select({
        attemptId: callAttempts.id,
        at: callAttempts.createdAt,
        disposition: callAttempts.disposition,
        interestTags: callAttempts.interestTags,
        linkTexted: callAttempts.linkTexted,
        note: callAttempts.note,
        transcript: callAttempts.transcript,
        leadId: leads.id,
        businessName: leads.businessName,
        niche: leads.niche,
        city: leads.city,
        contactName: leads.contactName,
        phone: leads.phone,
        phoneOverride: leads.phoneOverride,
      })
      .from(callAttempts)
      .innerJoin(leads, eq(callAttempts.leadId, leads.id))
      .where(scope)
      .orderBy(desc(callAttempts.createdAt))
      .limit(opts?.limit ?? 5000),
  ]);

  const rows: TranscriptRow[] = raw
    .filter((row) => row.transcript)
    .map((row) => ({
      attemptId: row.attemptId,
      at: row.at,
      disposition: row.disposition,
      interestTags: row.interestTags,
      linkTexted: row.linkTexted,
      note: row.note,
      transcript: row.transcript!,
      leadId: row.leadId,
      businessName: row.businessName,
      niche: row.niche,
      city: row.city,
      contactName: row.contactName,
      phone: row.phoneOverride ?? row.phone,
    }));

  return {
    rows,
    total,
    shown: rows.length,
  };
}

export function transcriptRangeLabel(filters: TranscriptFilters): string {
  if (filters.from && filters.to) return `${filters.from}_to_${filters.to}`;
  if (filters.from) return `from_${filters.from}`;
  if (filters.to) return `to_${filters.to}`;
  return "lifetime";
}

export function toExportRecord(row: TranscriptRow): TranscriptExportRecord {
  return {
    attempt_id: row.attemptId,
    called_at_vancouver: VANCOUVER_WHEN.format(row.at),
    called_at_iso: row.at.toISOString(),
    disposition: row.disposition,
    business_name: row.businessName,
    category: row.niche,
    city: row.city,
    contact_name: row.contactName,
    phone: row.phone,
    link_texted: row.linkTexted,
    interest_tags: row.interestTags.map((tag) => INTEREST_TAG_LABELS[tag]),
    note: row.note,
    transcript: row.transcript,
  };
}

function csvCell(value: string | number | boolean | null): string {
  const text = value === null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

const CSV_COLUMNS: (keyof TranscriptExportRecord)[] = [
  "attempt_id",
  "called_at_vancouver",
  "called_at_iso",
  "disposition",
  "business_name",
  "category",
  "city",
  "contact_name",
  "phone",
  "link_texted",
  "interest_tags",
  "note",
  "transcript",
];

export function toCsv(records: TranscriptExportRecord[]): string {
  const header = CSV_COLUMNS.join(",");
  const lines = records.map((record) =>
    CSV_COLUMNS.map((column) => {
      const value = record[column];
      if (column === "interest_tags" && Array.isArray(value)) {
        return csvCell(value.join("; "));
      }
      return csvCell(value as string | number | boolean | null);
    }).join(","),
  );
  return [header, ...lines].join("\n");
}
