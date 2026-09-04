"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CLOSED_STATE_LABELS,
  LEAD_PRESETS,
} from "@/lib/crm/constants";
import { adminRoutes } from "@/lib/routes";
import type { LeadStage } from "@/lib/types/crm";
import {
  clearedLeadsHref,
  hasLeadFilters,
  leadsHref,
  type LeadFilters,
} from "@/lib/validators/crm";

/**
 * The filter rail — the part of this surface that makes it a CRM rather than
 * an address book.
 *
 * Every control is a link or a select that writes the URL and nothing else:
 * there is no local filter state to fall out of step with what is on screen,
 * the back button works, and a filtered view can be sent to yourself. That is
 * also what makes a preset a plain link (D-CRM-34) instead of a stored object.
 *
 * No colored status dots and no count badges anywhere (D-CRM-22): a facet with
 * nothing behind it is a fact about the list, not a warning.
 */

const STAGE_ORDER: LeadStage[] = [
  "to_call",
  "trying",
  "in_conversation",
  "info_sent",
  "intake_sent",
  "client",
  "not_now",
  "not_interested",
  "do_not_call",
  "bad_lead",
];

/** Matches `STAGE_LABELS` in `chips.tsx`; the closed four come from the one
 * home that already names them. */
const STAGE_LABELS: Record<LeadStage, string> = {
  to_call: "To call",
  trying: "Trying",
  in_conversation: "In conversation",
  info_sent: "Info sent",
  intake_sent: "Intake sent",
  client: "Client",
  not_now: CLOSED_STATE_LABELS.not_now,
  not_interested: CLOSED_STATE_LABELS.not_interested,
  do_not_call: CLOSED_STATE_LABELS.do_not_call,
  bad_lead: CLOSED_STATE_LABELS.bad_lead,
};

const NEXT_ACTION_LABELS: Record<
  NonNullable<LeadFilters["nextAction"]>,
  string
> = {
  overdue: "Overdue",
  today: "Today",
  week: "This week",
  later: "Later",
  none: "No date",
};

const LAST_TOUCH_LABELS: Record<
  NonNullable<LeadFilters["lastTouch"]>,
  string
> = {
  never: "Never",
  under7: "Under 7 days",
  "7to30": "7 to 30 days",
  over30: "Over 30 days",
};

const SORT_LABELS: Record<LeadFilters["sort"], string> = {
  score: "Best score first",
  lastTouch: "Longest since touch",
  nextAction: "Next action soonest",
  name: "Name A–Z",
};

const WEBSITE_LABELS: Record<
  NonNullable<LeadFilters["websiteBucket"]>,
  string
> = {
  none: "No website",
  social_only: "Social only",
  real: "Has a real site",
};

export function LeadFilterRail({
  filters,
  niches,
  cities,
}: {
  filters: LeadFilters;
  niches: string[];
  cities: string[];
}) {
  // Client navigation, matching the queue's rail: a full document reload on
  // every select change reloads fonts and chrome for a list refresh.
  const router = useRouter();
  const href = (next: Partial<LeadFilters>) =>
    leadsHref(adminRoutes.leads, filters, next);

  const pill = (label: string, active: boolean, target: string) => (
    <Link
      key={label}
      href={target}
      aria-pressed={active}
      className={`min-h-[44px] rounded-(--radius) border px-3 py-2.5 text-sm ${
        active
          ? "border-(--color-c2)/60 text-(--color-ink)"
          : "border-(--color-line) text-(--color-body) hover:text-(--color-ink)"
      }`}
    >
      {label}
    </Link>
  );

  const select = (
    label: string,
    value: string,
    placeholder: string,
    options: { value: string; label: string }[],
    onPick: (value: string) => void,
  ) => (
    <select
      value={value}
      onChange={(event) => onPick(event.target.value)}
      aria-label={label}
      className="min-h-[44px] rounded-(--radius) border border-(--color-line) bg-(--color-well) px-2 text-sm text-(--color-body)"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  /** Toggling a stage chip keeps the others — stage is the one facet where
   * "trying or in conversation" is a question people actually ask. */
  const toggleStage = (stage: LeadStage) =>
    href({
      stages: filters.stages.includes(stage)
        ? filters.stages.filter((entry) => entry !== stage)
        : [...filters.stages, stage],
      preset: undefined,
    });

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-2">
        <h2 className="font-(family-name:--font-mono) text-[10px] tracking-[.28em] text-(--color-dim) uppercase">
          Saved views
        </h2>
        <div className="flex flex-wrap gap-2">
          {LEAD_PRESETS.map((preset) =>
            pill(
              preset.label,
              filters.preset === preset.token,
              href({
                preset:
                  filters.preset === preset.token ? undefined : preset.token,
                stages: [],
                shown: undefined,
              }),
            ),
          )}
        </div>
        {filters.preset ? (
          <p className="text-xs text-(--color-dim)">
            {LEAD_PRESETS.find((entry) => entry.token === filters.preset)?.blurb}
          </p>
        ) : null}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-(family-name:--font-mono) text-[10px] tracking-[.28em] text-(--color-dim) uppercase">
          Stage
        </h2>
        <div className="flex flex-wrap gap-2">
          {STAGE_ORDER.map((stage) =>
            pill(
              STAGE_LABELS[stage],
              filters.stages.includes(stage),
              toggleStage(stage),
            ),
          )}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-(family-name:--font-mono) text-[10px] tracking-[.28em] text-(--color-dim) uppercase">
          Next action
        </h2>
        <div className="flex flex-wrap gap-2">
          {(
            Object.keys(NEXT_ACTION_LABELS) as NonNullable<
              LeadFilters["nextAction"]
            >[]
          ).map((bucket) =>
            pill(
              NEXT_ACTION_LABELS[bucket],
              filters.nextAction === bucket,
              href({
                nextAction: filters.nextAction === bucket ? undefined : bucket,
                shown: undefined,
              }),
            ),
          )}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-(family-name:--font-mono) text-[10px] tracking-[.28em] text-(--color-dim) uppercase">
          Last touch
        </h2>
        <div className="flex flex-wrap gap-2">
          {(
            Object.keys(LAST_TOUCH_LABELS) as NonNullable<
              LeadFilters["lastTouch"]
            >[]
          ).map((bucket) =>
            pill(
              LAST_TOUCH_LABELS[bucket],
              filters.lastTouch === bucket,
              href({
                lastTouch: filters.lastTouch === bucket ? undefined : bucket,
                shown: undefined,
              }),
            ),
          )}
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        {pill(
          "No website",
          filters.thread === "no_website",
          href({
            thread: filters.thread === "no_website" ? undefined : "no_website",
            shown: undefined,
          }),
        )}
        {pill(
          "Has a site",
          filters.thread === "audit",
          href({
            thread: filters.thread === "audit" ? undefined : "audit",
            shown: undefined,
          }),
        )}
        {pill(
          "Has an email",
          filters.hasEmail,
          href({ hasEmail: !filters.hasEmail, shown: undefined }),
        )}
        {pill(
          "Has an engagement",
          filters.hasEngagement,
          href({ hasEngagement: !filters.hasEngagement, shown: undefined }),
        )}
        {pill(
          "Walk-in viable",
          filters.walkIn,
          href({ walkIn: !filters.walkIn, shown: undefined }),
        )}

        {select(
          "Filter by trade",
          filters.niche,
          "All trades",
          niches.map((niche) => ({ value: niche, label: niche })),
          (value) => router.push(href({ niche: value, shown: undefined })),
        )}

        {select(
          "Filter by city",
          filters.city,
          "All cities",
          cities.map((city) => ({ value: city, label: city })),
          (value) => router.push(href({ city: value, shown: undefined })),
        )}

        {select(
          "Filter by website",
          filters.websiteBucket ?? "",
          "Any website",
          (
            Object.keys(WEBSITE_LABELS) as NonNullable<
              LeadFilters["websiteBucket"]
            >[]
          ).map((bucket) => ({ value: bucket, label: WEBSITE_LABELS[bucket] })),
          (value) =>
            router.push(
              href({
                websiteBucket:
                  value === ""
                    ? undefined
                    : (value as NonNullable<LeadFilters["websiteBucket"]>),
                shown: undefined,
              }),
            ),
        )}

        <select
          value={filters.sort}
          onChange={(event) =>
            router.push(
              href({
                sort: event.target.value as LeadFilters["sort"],
                shown: undefined,
              }),
            )
          }
          aria-label="Sort leads"
          className="min-h-[44px] rounded-(--radius) border border-(--color-line) bg-(--color-well) px-2 text-sm text-(--color-body)"
        >
          {(Object.keys(SORT_LABELS) as LeadFilters["sort"][]).map((sort) => (
            <option key={sort} value={sort}>
              {SORT_LABELS[sort]}
            </option>
          ))}
        </select>

        {hasLeadFilters(filters) ? (
          <Link
            href={clearedLeadsHref(adminRoutes.leads, filters)}
            className="min-h-[44px] px-2 py-2.5 text-sm text-(--color-c2) underline"
          >
            Clear filters
          </Link>
        ) : null}
      </section>
    </div>
  );
}
