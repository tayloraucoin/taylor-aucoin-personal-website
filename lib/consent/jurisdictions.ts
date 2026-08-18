/**
 * Jurisdiction → consent regime.
 *
 * This table is the single source of truth for whether a visitor sees a
 * consent banner. It is keyed by ISO 3166-1 alpha-2 country code, with
 * optional ISO 3166-2 subdivision overrides for the places where the
 * country-level answer is wrong (Canada is the live example: PIPEDA permits
 * implied consent for analytics, Quebec's Law 25 does not).
 *
 * Not legal advice. This encodes common, defensible practice as of the last
 * review date below. Laws move; this table is meant to be edited.
 *
 * Last reviewed: 2026-08-17
 */

/**
 * What the law in a place requires of us, in terms of what the UI must do.
 *
 * - `prior-consent`     Non-essential storage is unlawful until the visitor
 *                       opts in. Banner shows; GA does not load until accept.
 * - `notice-and-opt-out` Analytics may run by default, but the visitor must be
 *                       told and must be able to opt out. No banner; disclosure
 *                       lives on /privacy and we honour Global Privacy Control.
 * - `unrestricted`      No specific mandate. We still disclose on /privacy and
 *                       still honour GPC, because there is no reason not to.
 */
export type ConsentRegime =
  "prior-consent" | "notice-and-opt-out" | "unrestricted";

type Rule = {
  regime: ConsentRegime;
  /** The instrument that produces this answer. Kept so the table can be audited. */
  basis: string;
};

/** ePrivacy Directive Art. 5(3) + GDPR. Prior opt-in for analytics storage. */
const EPRIVACY: Rule = {
  regime: "prior-consent",
  basis: "ePrivacy Directive 2002/58/EC Art. 5(3) + GDPR",
};

/** The 27 EU member states. */
const EU = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
] as const;

/** EEA states outside the EU. ePrivacy applies via the EEA Agreement. */
const EEA_NON_EU = ["IS", "LI", "NO"] as const;

const COUNTRY: Record<string, Rule> = {
  ...Object.fromEntries(EU.map((c) => [c, EPRIVACY])),
  ...Object.fromEntries(EEA_NON_EU.map((c) => [c, EPRIVACY])),

  GB: {
    regime: "prior-consent",
    basis: "PECR reg. 6 + UK GDPR",
  },

  // nFADP requires transparency about processing; it does not impose the
  // ePrivacy prior-opt-in rule for analytics cookies. Switzerland is
  // frequently lumped in with the EU by cautious implementations. It is not
  // the same rule, so it does not get the same treatment here.
  CH: {
    regime: "notice-and-opt-out",
    basis: "Swiss nFADP (revFADP) Art. 19 — transparency, not prior consent",
  },

  // PIPEDA accepts implied consent for non-sensitive analytics. Quebec is
  // overridden below.
  CA: {
    regime: "notice-and-opt-out",
    basis: "PIPEDA — implied consent for non-sensitive analytics",
  },

  // State privacy laws are opt-out regimes with universal-opt-out-mechanism
  // duties, which we satisfy globally by honouring GPC. See note below on why
  // there are no per-state rows.
  US: {
    regime: "notice-and-opt-out",
    basis: "State privacy laws (CPRA, CPA, CTDPA, TDPSA, et al.) — opt-out",
  },

  // LGPD permits legitimate interest as a basis for analytics; it does not
  // mandate a prior-consent banner.
  BR: {
    regime: "notice-and-opt-out",
    basis: "LGPD Art. 7(IX) — legitimate interest",
  },
};

/**
 * Subdivision overrides, keyed `${country}-${region}`.
 *
 * Only the places where the subdivision answer differs from its country's.
 * Vercel supplies the region code via `x-vercel-ip-country-region`.
 */
const SUBDIVISION: Record<string, Rule> = {
  "CA-QC": {
    regime: "prior-consent",
    basis: "Quebec Law 25, s. 8.1 — consent required for tracking technology",
  },
};

/**
 * No per-US-state rows exist on purpose.
 *
 * Every US state law that mandates a universal opt-out mechanism (California,
 * Colorado, Connecticut, Texas, Oregon, Montana, Delaware, New Jersey, New
 * Hampshire, Nebraska, Minnesota) is satisfied by honouring Global Privacy
 * Control — which `Analytics.tsx` does for every visitor on earth, not just
 * those states. Enumerating the states here would be dead data that drifts out
 * of date while changing no behaviour.
 */

/** The regime applied when geo is unavailable (local dev, unknown IP, bots). */
export const FALLBACK_REGIME: ConsentRegime = "unrestricted";

export function resolveRule(
  country: string | null | undefined,
  region?: string | null,
): Rule | null {
  if (!country) return null;
  const cc = country.toUpperCase();
  if (region) {
    const sub = SUBDIVISION[`${cc}-${region.toUpperCase()}`];
    if (sub) return sub;
  }
  return COUNTRY[cc] ?? null;
}

/** The one function the rest of the app needs. */
export function resolveRegime(
  country: string | null | undefined,
  region?: string | null,
): ConsentRegime {
  return resolveRule(country, region)?.regime ?? FALLBACK_REGIME;
}

export function requiresPriorConsent(regime: ConsentRegime): boolean {
  return regime === "prior-consent";
}

export function isConsentRegime(value: string): value is ConsentRegime {
  return (
    value === "prior-consent" ||
    value === "notice-and-opt-out" ||
    value === "unrestricted"
  );
}
