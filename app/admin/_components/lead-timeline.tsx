import {
  CLOSED_STATE_LABELS,
  DISPOSITION_LABELS,
  INTEREST_TAG_LABELS,
} from "@/lib/crm/constants";
import type { TimelineEntry } from "@/server/services/leads";
import { TranscriptField } from "./transcript-field";

const WHEN = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Vancouver",
  dateStyle: "medium",
  timeStyle: "short",
});

/**
 * Everything that has happened to this lead, newest first.
 *
 * Dials, emails, and the closing ruling in one list rather than three, because
 * the question this answers is "what happened with these people", and that
 * story runs across all of them.
 *
 * There is no stage-change entry: stage is derived, so it has no history of
 * its own. These events *are* the history — the stage is just their current
 * summary.
 */
export function LeadTimeline({
  entries,
  leadId,
}: {
  entries: TimelineEntry[];
  leadId: string;
}) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-(--color-dim)">
        Nothing yet. It starts with the first dial.
      </p>
    );
  }

  return (
    <ol className="flex flex-col">
      {entries.map((entry, index) => (
        <li
          key={`${entry.kind}-${entry.at.toISOString()}-${index}`}
          className="flex flex-col gap-1 border-l border-(--color-line-soft) py-3 pl-4"
        >
          <span className="text-xs text-(--color-dim)">
            {WHEN.format(entry.at)}
          </span>

          {entry.kind === "attempt" ? (
            <>
              <span className="text-sm text-(--color-ink)">
                {DISPOSITION_LABELS[entry.disposition]}
                {entry.interestTags.length
                  ? ` — ${entry.interestTags
                      .map((tag) => INTEREST_TAG_LABELS[tag])
                      .join(", ")}`
                  : ""}
              </span>
              {entry.note ? (
                <p className="text-sm whitespace-pre-wrap text-(--color-body)">
                  {entry.note}
                </p>
              ) : null}
              <TranscriptField
                attemptId={entry.id}
                leadId={leadId}
                initialValue={entry.transcript ?? ""}
              />
            </>
          ) : null}

          {entry.kind === "email" ? (
            <>
              <span className="text-sm text-(--color-ink)">
                {entry.delivered ? "Emailed" : "Email failed to send"}{" "}
                {entry.toEmail}
                {entry.promoIncluded ? " · with promo" : ""}
              </span>
              <span className="text-sm text-(--color-body)">
                {entry.subject}
              </span>
            </>
          ) : null}

          {entry.kind === "closed" ? (
            <span className="text-sm text-(--color-ink)">
              Marked {CLOSED_STATE_LABELS[entry.state].toLowerCase()}
              {entry.reason ? ` — ${entry.reason}` : ""}
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
