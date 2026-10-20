import { GA_MEASUREMENT_ID } from "@/lib/config";
import { PUBLISHED_SLUGS } from "@/lib/work/published";
import { stripQuery } from "./location";

/**
 * Everything GA4 may receive from this site, by event: each parameter's closed
 * set of values (technical/data-contract.md, D-SITE-226). No parameter takes
 * free text: never a name, an email, typed text, the filter query, or the
 * budget or start answers (D-SITE-176). `coded_intake_start` does not exist.
 */
export const EVENTS = {
  book_call_click: {
    required: ["surface", "placement"],
    params: {
      surface: [
        "home",
        "work-index",
        "case-study",
        "about",
        "services",
        "capabilities",
        "websites",
      ],
      placement: ["header", "hero", "close", "contact_sent", "screening_fit"],
      /** Case study only, and only a published slug: checked in `allowed`. */
      slug: PUBLISHED_SLUGS,
    },
  },
  screening_outcome: {
    required: ["outcome"],
    params: { outcome: ["fit", "not_a_fit", "website"] },
  },
  /** Fires on the server's confirmation, never on click (its caller's rule). */
  contact_note_sent: {
    required: ["surface", "from"],
    params: { surface: ["services"], from: ["contact", "not_a_fit"] },
  },
} as const satisfies Record<
  string,
  {
    required: readonly string[];
    params: Record<string, readonly string[]>;
  }
>;

export type EventName = keyof typeof EVENTS;

type Spec<E extends EventName> = (typeof EVENTS)[E];
type Values<E extends EventName, P> = P extends keyof Spec<E>["params"]
  ? Spec<E>["params"][P] extends readonly (infer V)[]
    ? V
    : never
  : never;
type RequiredOf<E extends EventName> = Spec<E>["required"][number];

export type EventParams<E extends EventName> = {
  [P in RequiredOf<E>]: Values<E, P>;
} & {
  [P in Exclude<keyof Spec<E>["params"], RequiredOf<E>>]?: string;
};

type Gtag = (...args: unknown[]) => void;

/**
 * The parameters that may leave, or `null` when the whole event must be
 * dropped: an unknown name, or a required parameter missing or outside its
 * set. An unknown parameter or a bad optional one is dropped on its own.
 */
export function allowedParams(
  name: string,
  params: Record<string, unknown>,
): Record<string, string> | null {
  if (!Object.hasOwn(EVENTS, name)) return null;
  const spec = EVENTS[name as EventName];
  const sets = spec.params as Record<string, readonly string[]>;

  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (!Object.hasOwn(sets, key)) continue;
    if (typeof value !== "string" || !sets[key].includes(value)) continue;
    out[key] = value;
  }

  // A slug names a case study, so it rides only on the case study's own click.
  if ("slug" in out && out.surface !== "case-study") delete out.slug;

  for (const key of spec.required) if (!(key in out)) return null;
  return out;
}

/** gtag, only once the consent gate has loaded the tag and not since disabled. */
function liveGtag(): Gtag | null {
  const w = globalThis as unknown as Record<string, unknown>;
  if (typeof w.gtag !== "function") return null;
  if (GA_MEASUREMENT_ID && w[`ga-disable-${GA_MEASUREMENT_ID}`] === true)
    return null;
  return w.gtag as Gtag;
}

/**
 * Sets the page fields every hit carries, `q` stripped (D-SITE-179). gtag.js
 * adds `dl` and `dr` to events as well as page views, so this runs before
 * each hit, never once at load.
 */
export function setStrippedPage(gtag: Gtag) {
  const location = globalThis.location?.href ?? "";
  const referrer = globalThis.document?.referrer ?? "";
  gtag("set", {
    page_location: stripQuery(location),
    page_referrer: stripQuery(referrer),
  });
}

/** Sends one registry event to GA4, filtered; anything else is never sent. */
export function track<E extends EventName>(name: E, params: EventParams<E>) {
  const gtag = liveGtag();
  if (!gtag) return;
  const allowed = allowedParams(name, params as Record<string, unknown>);
  if (!allowed) return;
  setStrippedPage(gtag);
  gtag("event", name, allowed);
}
