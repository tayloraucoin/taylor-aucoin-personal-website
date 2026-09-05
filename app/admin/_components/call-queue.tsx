"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DISPOSITION_LABELS } from "@/lib/crm/constants";
import { adminRoutes } from "@/lib/routes";
import type { QueueBands, QueueLead } from "@/server/services/leads";
import { CallPanel, type CallPhase } from "./call-panel";
import { CallSheetColumn } from "./call-sheet-column";
import { StageChip, WindowChip } from "./chips";
import { DayStrip } from "./day-strip";
import { hasModifier, isTypingTarget } from "./keyboard";
import { NativeSelect } from "@/components/ui/native-select";

/**
 * Who to call next, and the whole loop of calling them.
 *
 * This component owns the call-mode phase (CRM-15, spec §3.8) because the
 * phase decides the layout: browsing shows the list beside a pre-call panel,
 * and calling swaps the left column for the script. Keeping the phase in one
 * place is deliberate — the defects this redesign was commissioned to fix all
 * came from two components each holding half of the same state.
 *
 * Leads logged during this session are held in `handled` and hidden
 * immediately, rather than waiting for the server to re-render. A call block is
 * a rhythm — hang up, log, next — and a list that pauses between each one
 * breaks it.
 */

type Filters = {
  thread: string;
  niche: string;
  readyNow: boolean;
  /** How many fresh leads are rendered. Grows via "show more". */
  shown: number;
};

/** Callable right now — not a due-today promise whose time hasn't arrived. */
function isActionableNow(lead: QueueLead) {
  return lead.nextActionAt === null || lead.nextActionAt.getTime() <= Date.now();
}

export function CallQueue({
  bands,
  filters,
  nowHours,
  niches,
  callSheet,
}: {
  bands: QueueBands;
  filters: Filters;
  nowHours: number;
  niches: string[];
  /** The call sheet's markdown, read server-side. Empty when unreadable. */
  callSheet: string;
}) {
  const [handled, setHandled] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // The lead-record Sheet is a sibling at the page level, not a child of this
  // component (`?lead=` decides whether the page renders it) — so this reads
  // the same URL fact rather than duplicating it. While it's open, a digit
  // reaching CallPanel's disposition handler behind the overlay would log a
  // phantom call; j/k reaching this list would move a selection nobody can
  // see. Both go inert together, read from one place (CRM-13).
  const sheetOpen = Boolean(useSearchParams().get("lead"));

  /**
   * The call being finished, held apart from the list.
   *
   * Logging a disposition revalidates the queue, and a logged lead has a next
   * action so the server stops returning it — which used to pull the row out
   * from under the focus card mid-follow-up, reassign the selection, and wipe
   * the panel offering the intro email. The card's subject is the call in
   * hand, not whatever row the list currently highlights.
   */
  const [working, setWorking] = useState<QueueLead | null>(null);

  /**
   * Where the current call is (spec §3.8). `precall` is the browsing state;
   * everything else means a call is in hand and the left column belongs to
   * the script rather than the list.
   */
  const [phase, setPhase] = useState<CallPhase>({ kind: "precall" });
  const calling = phase.kind !== "precall";

  const groups = useMemo(
    () =>
      [
        { key: "overdue", title: "Overdue callbacks", leads: bands.overdue },
        { key: "today", title: "Due today", leads: bands.dueToday },
        { key: "fresh", title: "Fresh", leads: bands.fresh },
      ]
        .map((group) => ({
          ...group,
          leads: group.leads.filter((lead) => !handled.has(lead.id)),
        }))
        .filter((group) => group.leads.length > 0),
    [bands, handled],
  );

  const flat = useMemo(() => groups.flatMap((group) => group.leads), [groups]);

  const actionable = useMemo(() => flat.filter(isActionableNow), [flat]);

  // Keep a selection on the list at all times, so Enter and the number keys
  // always have a subject.
  useEffect(() => {
    if (flat.length === 0) {
      setSelectedId(null);
    } else if (!selectedId || !flat.some((lead) => lead.id === selectedId)) {
      // Prefer something callable right now; if literally everything left is a
      // promise for later today, fall back to the soonest one rather than
      // stranding the queue with no selection.
      setSelectedId((actionable[0] ?? flat[0])!.id);
    }
  }, [flat, actionable, selectedId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (hasModifier(event) || isTypingTarget(event)) return;
      if (sheetOpen) return;

      // Esc leaves call mode before anything is logged. Once an attempt row
      // exists the phase is `logged`, and leaving is Next lead's job — Esc
      // must never look like a way to undo a call that is already recorded.
      if (event.key === "Escape" && phase.kind === "dialing") {
        event.preventDefault();
        // Nothing was logged, so the pin comes off with the phase.
        setWorking(null);
        setPhase({ kind: "precall" });
        return;
      }

      // Moving the selection only makes sense while browsing: mid-call the
      // list is not even on screen, and a pinned call outranks it regardless.
      if (calling || working) return;
      if (event.key !== "j" && event.key !== "k") return;

      event.preventDefault();
      const index = flat.findIndex((lead) => lead.id === selectedId);
      const next = event.key === "j" ? index + 1 : index - 1;
      if (next >= 0 && next < flat.length) setSelectedId(flat[next]!.id);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flat, selectedId, working, sheetOpen, phase, calling]);

  const selected = flat.find((lead) => lead.id === selectedId) ?? null;
  // A pinned call outranks the list until it is released.
  const subject = working ?? selected;

  /**
   * Entering call mode pins the subject, before anything is logged.
   *
   * "Call now" means the phone is already ringing, so from that moment the
   * panel must be about *this* business and nothing the list does can change
   * it. Pinning only at save time left a window where a revalidation could
   * reassign the selection mid-dial and put the next lead's name above a
   * conversation that was happening with the previous one.
   */
  const changePhase = (next: CallPhase) => {
    // Back out of a call that was never logged: the pin comes off with it.
    // Returning to `precall` any other way goes through `onAdvance`, which
    // releases a *logged* call — this path only ever unwinds an unlogged one.
    if (next.kind === "precall") setWorking(null);
    else if (subject) setWorking(subject);
    setPhase(next);
  };

  /**
   * Release the finished call and land on the next lead's pre-call panel
   * (§3.8 state 5) — facts and window before the next dial, rather than
   * chaining straight into another script.
   */
  const onAdvance = (leadId: string) => {
    setWorking(null);
    setPhase({ kind: "precall" });
    setHandled((prior) => new Set(prior).add(leadId));
  };

  return (
    <div className="flex flex-col gap-6">
      <FilterBar filters={filters} niches={niches} />

      <details className="text-sm">
        <summary className="cursor-pointer text-(--color-dim)">
          When each trade is reachable
        </summary>
        <div className="pt-4">
          <DayStrip nowHours={nowHours} />
        </div>
      </details>

      {flat.length === 0 && !subject ? (
        <EmptyQueue bands={bands} filters={filters} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
          {/* The column swap (§3.8): browsing shows the list, calling shows
              the script. One grid, one subject, so the panel on the right
              never changes which lead it is about mid-call. */}
          {calling && subject ? (
            // Second on a phone, first on a laptop: when the same device is
            // the dialer and the screen, the disposition row has to be under
            // the thumb and the reading material below it (D-CRM-29).
            //
            // Bounded to the viewport with its own scroll on desktop — a
            // long script and a long conversation form are different
            // lengths, and letting the taller one stretch the page carries
            // the shorter one along with it, which is what made the bottom
            // of the panel unreachable.
            <div className="order-2 lg:order-1 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
              <CallSheetColumn source={callSheet} lead={subject} />
            </div>
          ) : (
          <div className="flex flex-col gap-6">
            {groups.map((group) => (
              <section key={group.key} className="flex flex-col gap-2">
                <h2 className="flex flex-wrap items-baseline gap-x-3 text-xs tracking-wide text-(--color-dim) uppercase">
                  {group.title}
                  {group.key === "fresh" && bands.freshTotal > group.leads.length
                    ? `— showing ${group.leads.length} of ${bands.freshTotal}`
                    : ""}
                </h2>

                <ul className="flex flex-col">
                  {group.leads.map((lead) => (
                    <QueueRow
                      key={lead.id}
                      lead={lead}
                      overdue={group.key === "overdue"}
                      selected={lead.id === selectedId}
                      showWindow={!filters.readyNow}
                      onSelect={() => setSelectedId(lead.id)}
                    />
                  ))}
                </ul>

                {group.key === "fresh" &&
                bands.freshTotal > group.leads.length ? (
                  <Link
                    href={showMoreHref(filters, bands.fresh.length)}
                    scroll={false}
                    className="min-h-[44px] w-fit rounded-(--radius) border border-(--color-line-strong) px-4 py-2.5 text-sm text-(--color-body)"
                  >
                    Show {Math.min(50, bands.freshTotal - group.leads.length)}{" "}
                    more
                  </Link>
                ) : null}
              </section>
            ))}
          </div>
          )}

          <div
            className={`lg:sticky lg:top-6 lg:self-start ${
              calling
                ? "order-1 lg:order-2 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto"
                : ""
            }`}
          >
            {subject ? (
              <CallPanel
                lead={subject}
                phase={phase}
                sheetOpen={sheetOpen}
                onPhase={changePhase}
                onHold={setWorking}
                onAdvance={onAdvance}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The queue's URL. `shown` is deliberately dropped when a filter changes — a
 * different list starts at the first page again — and carried only by the
 * "show more" link that owns it.
 */
function queueHref(filters: Filters, next: Partial<Filters>): string {
  const merged = { ...filters, ...next };
  const params = new URLSearchParams();
  if (merged.thread) params.set("thread", merged.thread);
  if (merged.niche) params.set("niche", merged.niche);
  if (merged.readyNow) params.set("ready", "1");
  if (next.shown) params.set("shown", String(next.shown));
  const query = params.toString();
  return query ? `${adminRoutes.queue}?${query}` : adminRoutes.queue;
}

function showMoreHref(filters: Filters, currentlyShown: number): string {
  return queueHref(filters, { shown: currentlyShown + 50 });
}

function QueueRow({
  lead,
  overdue,
  selected,
  showWindow,
  onSelect,
}: {
  lead: QueueLead;
  overdue: boolean;
  selected: boolean;
  showWindow: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        className={`flex w-full min-h-[44px] flex-wrap items-center gap-x-3 gap-y-1 border-l-2 px-3 py-2 text-left ${
          selected
            ? "border-(--color-c2) bg-(--color-tint)"
            : "border-transparent hover:bg-(--color-tint)/60"
        }`}
      >
        <span className="text-sm text-(--color-ink)">{lead.businessName}</span>

        <span className="text-xs text-(--color-dim)">
          {lead.niche} · {lead.city}
        </span>

        {lead.rating !== null ? (
          <span className="text-xs text-(--color-body)">
            {lead.rating} × {lead.reviews ?? 0}
          </span>
        ) : null}

        <span className="ml-auto flex items-center gap-3">
          {lead.attemptCount > 0 ? (
            <span className="text-xs text-(--color-dim)">
              {lead.attemptCount} {lead.attemptCount === 1 ? "try" : "tries"}
              {lead.lastDisposition
                ? ` · ${DISPOSITION_LABELS[lead.lastDisposition].toLowerCase()}`
                : ""}
            </span>
          ) : null}

          {overdue && lead.nextActionNote ? (
            <span className="text-xs text-(--color-c2)">
              {lead.nextActionNote}
            </span>
          ) : null}

          {showWindow ? <WindowChip window={lead.window} /> : null}
          <StageChip stage={lead.stage} />
        </span>
      </button>
    </li>
  );
}

/**
 * Never a dead end (D-CRM-19).
 *
 * Toggling "ready to call now" at 9am legitimately empties the list — auto
 * shops are in the drop-off rush and the trades are already on site. Saying
 * only "nothing here" would read as "no work left", so this names what opens
 * next, how many are behind it, and offers the way out.
 */
function EmptyQueue({
  bands,
  filters,
}: {
  bands: QueueBands;
  filters: Filters;
}) {
  const whenNextDue = bands.nextDueAt
    ? new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Vancouver",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(bands.nextDueAt)
    : null;

  return (
    <div className="flex max-w-prose flex-col gap-4 border-t border-(--color-line-soft) pt-6">
      <p className="text-sm text-(--color-ink)">
        {filters.readyNow
          ? "Nothing is in its best window right now."
          : "Nothing due."}
      </p>

      {bands.waiting.length ? (
        <ul className="flex flex-col gap-1">
          {bands.waiting.map((entry) => (
            <li key={entry.label} className="text-sm text-(--color-body)">
              {entry.label}
              {entry.opensAt ? ` open up at ${entry.opensAt}` : ""} —{" "}
              {entry.count} waiting
            </li>
          ))}
        </ul>
      ) : null}

      {bands.scheduledLater > 0 ? (
        <p className="text-sm text-(--color-body)">
          {bands.scheduledLater} scheduled for later
          {whenNextDue ? `, next due ${whenNextDue}` : ""}.
        </p>
      ) : null}

      {filters.readyNow ? (
        <Link
          href={`${adminRoutes.queue}?thread=${filters.thread}`}
          className="min-h-[44px] w-fit rounded-(--radius) border border-(--color-line-strong) px-4 py-2.5 text-sm text-(--color-ink)"
        >
          Show everyone anyway
        </Link>
      ) : null}
    </div>
  );
}

function FilterBar({
  filters,
  niches,
}: {
  filters: Filters;
  niches: string[];
}) {
  // Client navigation, matching the tabs beside it. `window.location.href`
  // here forced a full document reload — fonts, chrome and all — every time
  // the trade filter changed.
  const router = useRouter();

  const href = (next: Partial<Filters>) => queueHref(filters, next);

  const tab = (label: string, active: boolean, target: string) => (
    <Link
      key={label}
      href={target}
      className={`min-h-[44px] rounded-(--radius) border px-3 py-2.5 text-sm ${
        active
          ? "border-(--color-c2)/60 text-(--color-ink)"
          : "border-(--color-line) text-(--color-body)"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tab(
        "No website",
        filters.thread === "no_website",
        href({ thread: "no_website" }),
      )}
      {tab("Has a site", filters.thread === "audit", href({ thread: "audit" }))}

      {tab(
        "Ready to call now",
        filters.readyNow,
        href({ readyNow: !filters.readyNow }),
      )}

      <NativeSelect
        value={filters.niche}
        onChange={(event) => {
          router.push(href({ niche: event.target.value }));
        }}
        aria-label="Filter by trade"
      >
        <option value="">All trades</option>
        {niches.map((niche) => (
          <option key={niche} value={niche}>
            {niche}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
