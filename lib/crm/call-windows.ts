/**
 * When each trade is actually reachable by phone.
 *
 * The premise, and why the published numbers are wrong for this list: every
 * cold-call timing study says 10–11am and 4–5pm, Tuesday to Thursday. Those
 * studies watched SDRs dial knowledge workers sitting at desks between
 * meetings. This list is people under a car or on a roof, and the textbook
 * "peak window" is the exact hour a field tradesperson cannot answer. The one
 * finding that transfers is the day-of-week shape.
 *
 * **This is a labeled hypothesis, not data** (D-CRM-21). It is reasoned from
 * how these trades structure a day plus one contractor's account, and it has
 * never been checked against Taylor's own outcomes. The scoreboard reports
 * real reach rate by tier and is allowed to falsify all of it; when it does,
 * this file is the one place to edit.
 *
 * Config, not a table: this is sales judgment, versioned in git and reviewed
 * as code. A table would imply an editing UI nobody needs and become a second
 * home for something a config file already owns (M-CRM-6).
 */

export type CallWindowProfile =
  "storefront" | "field_trade" | "solo_mobile" | "unknown";

/** How good the current moment is for this profile. */
export type WindowTier = "best" | "fair" | "avoid" | "unknown";

/** How good the current weekday is. Applies across profiles. */
export type DayTier = "best" | "good" | "poor" | "avoid";

/**
 * An hour range in decimal local hours — 13.5 is 1:30pm.
 *
 * Decimal rather than {hour, minute} because every operation here is a
 * comparison, and comparing two numbers cannot be got wrong the way comparing
 * two pairs can.
 */
type HourRange = { readonly from: number; readonly to: number };

type ProfileConfig = {
  readonly label: string;
  readonly best: readonly HourRange[];
  readonly fair: readonly HourRange[];
  /** Why the closed hours are closed. Display copy, not logic. */
  readonly avoidNote: string;
  /** Whether turning up in person beats calling. Storefronts only. */
  readonly walkInViable: boolean;
};

/**
 * The profile table (D-CRM-17). Times are `America/Vancouver` wall clock.
 *
 * Anything outside `best` and `fair` is treated as avoid — the tiers are
 * decided by what is listed, so an unlisted hour (9pm, say) can never be
 * mistaken for callable. `avoidNote` explains the closed hours a person would
 * otherwise think were fine; it never affects the tier.
 */
export const CALL_WINDOW_PROFILES: Record<
  Exclude<CallWindowProfile, "unknown">,
  ProfileConfig
> = {
  storefront: {
    label: "Auto shops",
    best: [
      { from: 10, to: 11.5 },
      { from: 13.5, to: 15.5 },
    ],
    fair: [{ from: 15.5, to: 16 }],
    avoidNote:
      "Drop-off rush before 9, pickup rush after 4. They answer expecting a customer — defuse that in the first seven words.",
    walkInViable: true,
  },
  field_trade: {
    label: "Field trades",
    best: [
      { from: 7, to: 7.75 },
      { from: 16.5, to: 18 },
    ],
    fair: [{ from: 11.75, to: 12.5 }],
    avoidNote:
      "On a job site from 8. The evening window catches them driving home — hands-free, mildly bored, and unable to hang up to go do something.",
    walkInViable: false,
  },
  solo_mobile: {
    label: "House cleaning",
    best: [
      { from: 7, to: 8.5 },
      { from: 16.5, to: 18 },
    ],
    fair: [],
    avoidNote:
      "In someone's home 9–4 with the phone in a bag in another room. Heavy screening of unknown numbers; expect two or three touches.",
    walkInViable: false,
  },
};

/**
 * Niche to profile. The vocabulary is a closed set of eight, config-driven in
 * leadgen and verified identical across both exports (2026-08-21).
 *
 * A niche not listed here resolves to `unknown` and is never given a window
 * claim — see `getCallWindow`. Never guess a window for a trade this table
 * does not know.
 */
export const NICHE_PROFILES: Record<string, CallWindowProfile> = {
  "auto repair shop": "storefront",
  electrician: "field_trade",
  plumber: "field_trade",
  "hvac contractor": "field_trade",
  "roofing contractor": "field_trade",
  "landscaping company": "field_trade",
  "pest control": "field_trade",
  "house cleaning service": "solo_mobile",
};

/**
 * Day-of-week tiers, indexed by `Date.getDay()` (0 = Sunday).
 *
 * Monday is triage across every trade — weekend emergencies and the week's
 * scheduling — and auto shops take it worst, since every weekend breakdown
 * arrives in the bay at once. Friday afternoon in summer is a ghost town for
 * anything outdoors.
 */
const DAY_TIERS: readonly DayTier[] = [
  "avoid", // Sun
  "poor", // Mon
  "good", // Tue
  "best", // Wed
  "good", // Thu
  "poor", // Fri
  "poor", // Sat
];

/**
 * Seasonal pitch guidance (D-CRM-20). **Advisory copy only** — it never
 * filters, reorders, or scores.
 *
 * Peak season means flush and uninterested; shoulder season means hungry. A
 * roofer booked into October does not want "get more calls", so the hook has
 * to change rather than the hour. Keyed by 1-indexed month.
 */
const SEASONAL_NOTES: Record<string, { months: number[]; note: string }[]> = {
  electrician: [
    {
      months: [5, 6, 7, 8],
      note: "Peak season — they're turning work away. Lead with credibility against competitors who have real sites, not lead volume.",
    },
  ],
  "roofing contractor": [
    {
      months: [5, 6, 7, 8, 9],
      note: "Peak season — likely booked out weeks. The opening is October–November, when the shoulder hits and they get hungry.",
    },
    {
      months: [10, 11],
      note: "Shoulder season — this is the window. Lead volume lands properly now.",
    },
  ],
  "landscaping company": [
    {
      months: [4, 5, 6, 7, 8, 9],
      note: "Peak season — stretched thin. Credibility hook, not lead volume.",
    },
  ],
  plumber: [
    {
      months: [9, 10, 11, 12],
      note: "Ramping into their busy stretch — good time to be quoting.",
    },
  ],
  "hvac contractor": [
    {
      months: [6, 7, 8],
      note: "Cooling peak — busy. Credibility hook.",
    },
    {
      months: [11, 12, 1, 2],
      note: "Heating peak — busy. Credibility hook.",
    },
  ],
  "pest control": [
    {
      months: [4, 5, 6, 7, 8],
      note: "Peak season — busy. Credibility hook.",
    },
  ],
};

const VANCOUVER = "America/Vancouver";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Formatters are built once and reused.
 *
 * `new Intl.DateTimeFormat(...)` costs ~49µs; calling `formatToParts` on an
 * existing one costs ~6µs. These are called per lead per request, so
 * constructing them inline made the queue's cost scale with list length for no
 * reason. `format`/`formatToParts` do not mutate, so a shared instance is safe.
 */
const CLOCK_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: VANCOUVER,
  hourCycle: "h23",
  hour: "2-digit",
  minute: "2-digit",
  weekday: "short",
});

const DATE_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: VANCOUVER,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const MONTH_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: VANCOUVER,
  month: "numeric",
});

const OFFSET_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: VANCOUVER,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/**
 * The local wall clock in Vancouver, as decimal hours plus a weekday index.
 *
 * **This is the bug this module exists to prevent.** Vercel runs UTC, so a
 * plain `new Date().getHours()` puts every window seven or eight hours off —
 * silently, confidently, and in a way that looks like the model is simply
 * wrong rather than that the clock is. Everything goes through `Intl` with an
 * explicit zone, which also means DST is the platform's problem and never
 * ours.
 *
 * `hourCycle: "h23"` rather than `hour12: false`: the latter renders midnight
 * as "24" in some runtimes, which would put every lead's midnight into an
 * hour that does not exist.
 */
function vancouverClock(now: Date): { hours: number; weekday: number } {
  const parts = CLOCK_FORMAT.formatToParts(now);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const weekdayIndex = WEEKDAYS.indexOf(value("weekday"));

  return {
    hours: Number(value("hour")) + Number(value("minute")) / 60,
    weekday: weekdayIndex === -1 ? 0 : weekdayIndex,
  };
}

const inAny = (ranges: readonly HourRange[], hours: number) =>
  ranges.some((range) => hours >= range.from && hours < range.to);

/** `13.5` becomes `"1:30pm"` — how the chip and the empty state say a time. */
export function formatHour(value: number): string {
  const hour = Math.floor(value);
  const minute = Math.round((value - hour) * 60);
  const suffix = hour >= 12 ? "pm" : "am";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return minute === 0
    ? `${display}${suffix}`
    : `${display}:${String(minute).padStart(2, "0")}${suffix}`;
}

export type CallWindow = {
  profile: CallWindowProfile;
  /** How good right now is. `unknown` when the niche has no profile. */
  tier: WindowTier;
  /** True for `best` and `fair`. What "Ready to call now" filters on. */
  isOpenNow: boolean;
  dayTier: DayTier;
  walkInViable: boolean;
  /**
   * When this profile next opens, as a wall-clock label — `"10am"`, with
   * `nextOpensTomorrow` saying which day.
   *
   * Deliberately a label rather than a `Date`. The UI needs a time to show,
   * and converting a future wall-clock back into a UTC instant across a DST
   * boundary is fiddly arithmetic whose only consumer is a string. Null when
   * the profile is unknown or already open.
   */
  nextOpensAt: string | null;
  nextOpensTomorrow: boolean;
  /** The chip's text: "good now", "best 4:30pm". */
  label: string;
  /** Why the closed hours are closed. Display copy. */
  avoidNote: string | null;
  /** Advisory pitch guidance for the season. Never affects sorting. */
  seasonalNote: string | null;
};

/**
 * Everything the queue, the chip, and the focus card need to know about
 * reaching this niche right now.
 *
 * An unmapped niche returns `tier: "unknown"` with `isOpenNow: true` — it is
 * never filtered out of the queue by a model that has no opinion about it. The
 * sync screen counts these so the config gets updated rather than a whole
 * trade being quietly mis-advised.
 */
export function getCallWindow(niche: string, now: Date): CallWindow {
  const profile = NICHE_PROFILES[niche.trim().toLowerCase()] ?? "unknown";
  const { hours, weekday } = vancouverClock(now);
  const dayTier = DAY_TIERS[weekday] ?? "good";

  if (profile === "unknown") {
    return {
      profile,
      tier: "unknown",
      // No opinion is not the same as a bad time. Never hide what we can't rate.
      isOpenNow: true,
      dayTier,
      walkInViable: false,
      nextOpensAt: null,
      nextOpensTomorrow: false,
      label: "no window set",
      avoidNote: null,
      seasonalNote: null,
    };
  }

  const config = CALL_WINDOW_PROFILES[profile];
  const tier: WindowTier = inAny(config.best, hours)
    ? "best"
    : inAny(config.fair, hours)
      ? "fair"
      : "avoid";

  const starts = [...config.best]
    .map((range) => range.from)
    .sort((a, b) => a - b);
  const laterToday = starts.find((start) => start > hours);
  const nextStart = laterToday ?? starts[0] ?? null;

  const dayOk = dayTier === "best" || dayTier === "good";
  const openNow = (tier === "best" || tier === "fair") && dayOk;

  return {
    profile,
    tier,
    isOpenNow: openNow,
    dayTier,
    walkInViable: config.walkInViable,
    nextOpensAt: openNow || nextStart === null ? null : formatHour(nextStart),
    nextOpensTomorrow: !openNow && laterToday === undefined,
    label: openNow
      ? tier === "best"
        ? "good now"
        : "okay now"
      : nextStart === null
        ? "no window set"
        : `best ${formatHour(nextStart)}`,
    avoidNote: config.avoidNote,
    seasonalNote: seasonalNoteFor(niche, now),
  };
}

/** The month in Vancouver, 1-indexed. Same zone discipline as the clock. */
function vancouverMonth(now: Date): number {
  return Number(MONTH_FORMAT.format(now));
}

export function seasonalNoteFor(niche: string, now: Date): string | null {
  const entries = SEASONAL_NOTES[niche.trim().toLowerCase()];
  if (!entries) return null;

  const month = vancouverMonth(now);
  return entries.find((entry) => entry.months.includes(month))?.note ?? null;
}

/** True when the niche has no profile — the sync screen counts these. */
export function isUnmappedNiche(niche: string): boolean {
  return NICHE_PROFILES[niche.trim().toLowerCase()] === undefined;
}

/**
 * The UTC offset in effect in Vancouver at a given instant, in milliseconds.
 * Negative (UTC-7 in summer, UTC-8 in winter).
 */
function zoneOffsetMs(at: Date): number {
  const parts = OFFSET_FORMAT.formatToParts(at);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  // The local wall-clock fields, read as though they were UTC. The gap between
  // that and the real instant is the offset.
  const asIfUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );

  return asIfUtc - at.getTime();
}

/** The UTC instant of local midnight on a `YYYY-MM-DD` Vancouver date. */
function vancouverMidnight(isoDate: string): Date {
  const guess = new Date(`${isoDate}T00:00:00Z`);
  const offset = zoneOffsetMs(guess);
  const candidate = new Date(guess.getTime() - offset);

  // One correction pass: if the guess landed on the far side of a DST change,
  // the offset at the candidate is the right one to use.
  const corrected = zoneOffsetMs(candidate);
  return corrected === offset
    ? candidate
    : new Date(guess.getTime() - corrected);
}

/**
 * Today's boundaries in Vancouver, as UTC instants for the queue's date
 * comparisons.
 *
 * "Overdue" and "due today" are what a person means by those words where they
 * are standing, not where the server is. On Vercel — which runs UTC — a naive
 * midnight would roll the queue over at 5pm Pacific, quietly moving the whole
 * afternoon's callbacks into "overdue" while Taylor was still working them.
 *
 * Tomorrow is computed from its own date rather than by adding 24 hours: DST
 * days are 23 or 25 hours long, and twice a year the arithmetic version is off
 * by one.
 */
export function vancouverDayBounds(now: Date): {
  startOfToday: Date;
  startOfTomorrow: Date;
} {
  const today = DATE_FORMAT.format(now);

  const [year, month, day] = today.split("-").map(Number);
  const nextDay = new Date(Date.UTC(year!, month! - 1, day! + 1));
  const tomorrow = nextDay.toISOString().slice(0, 10);

  return {
    startOfToday: vancouverMidnight(today),
    startOfTomorrow: vancouverMidnight(tomorrow),
  };
}

/**
 * `n` business days after `from`, at 9am Vancouver.
 *
 * Weekends are skipped because a callback scheduled for Saturday is a callback
 * that will not happen. Statutory holidays are not handled — a maintained
 * holiday list is not worth its upkeep here, and a wasted dial is cheap
 * (`[REVISIT]` when one actually lands in a call block).
 */
export function addBusinessDays(from: Date, days: number): Date {
  const cursor = new Date(from.getTime());
  let remaining = days;

  while (remaining > 0) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    const weekday = vancouverClock(cursor).weekday;
    if (weekday !== 0 && weekday !== 6) remaining--;
  }

  return new Date(
    vancouverMidnight(DATE_FORMAT.format(cursor)).getTime() + 9 * 60 * 60 * 1000,
  );
}

/**
 * A Vancouver wall-clock time `daysAhead` from now, at `hour`.
 *
 * Callback times are chosen from chips ("tomorrow AM") rather than typed, and
 * they are resolved here rather than in the browser: the zone logic has one
 * home, and a callback does not land an hour off because Taylor opened the
 * queue from a hotel in Toronto.
 */
export function vancouverAt(now: Date, daysAhead: number, hour: number): Date {
  const cursor = new Date(now.getTime());
  cursor.setUTCDate(cursor.getUTCDate() + daysAhead);

  return new Date(
    vancouverMidnight(DATE_FORMAT.format(cursor)).getTime() +
      hour * 60 * 60 * 1000,
  );
}

/** The Vancouver weekday of an instant, as `"Mon"`. Used to group history. */
export function vancouverWeekdayLabel(at: Date): string {
  return WEEKDAYS[vancouverClock(at).weekday] ?? "Sun";
}

/** Display name for a profile, including the unmapped case. */
export function profileLabel(profile: CallWindowProfile): string {
  return profile === "unknown"
    ? "No profile"
    : CALL_WINDOW_PROFILES[profile].label;
}
