"use client";

import { useCallback, useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GA_MEASUREMENT_ID } from "@/lib/config";
import {
  CONSENT_STORAGE_KEY,
  REGIME_COOKIE,
  type ConsentChoice,
} from "@/lib/consent/constants";
import {
  FALLBACK_REGIME,
  isConsentRegime,
  requiresPriorConsent,
  type ConsentRegime,
} from "@/lib/consent/jurisdictions";
import ConsentBanner from "./ConsentBanner";
import PageViews from "./PageViews";

type Status =
  /** First paint, before the browser has told us anything. Renders nothing. */
  | "resolving"
  /** Load the tag. */
  | "load"
  /** Prior consent required and not yet given. Banner, no tag. */
  | "ask"
  /** Declined, or GPC. No tag, no banner, no nagging. */
  | "off";

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function readStoredChoice(): ConsentChoice | null {
  try {
    const v = localStorage.getItem(CONSENT_STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    // Safari in Lockdown Mode, private-mode quota, embedded webviews.
    return null;
  }
}

export function writeStoredChoice(choice: ConsentChoice) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Choice still applies to this page load; it just will not survive it.
  }
  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
}

/** Lets /privacy's control and this gate stay in sync within one tab. */
export const CONSENT_CHANGED_EVENT = "ta:consent-changed";

/** Global Privacy Control. Legally recognised opt-out signal in a growing
 *  number of US states; we honour it everywhere, which is strictly more than
 *  any of them require. See lib/consent/jurisdictions.ts. */
function hasGpcOptOut(): boolean {
  return (
    (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl === true
  );
}

/**
 * Google's own opt-out switch. Setting `window['ga-disable-<ID>'] = true` makes
 * gtag.js a no-op even if it has already executed.
 *
 * This matters because unmounting <GoogleAnalytics> only removes the <script>
 * tag from the DOM — it does not unload the code that tag already ran. Without
 * this flag, a visitor who opted out on /privacy would keep being measured by
 * GA4's history-based page_view until they reloaded. That would make the
 * control a lie.
 */
function setGaDisabled(gaId: string, disabled: boolean) {
  (window as unknown as Record<string, boolean>)[`ga-disable-${gaId}`] =
    disabled;
}

/** Best-effort removal of the cookies gtag already wrote (`_ga`, `_ga_<ID>`). */
function clearGaCookies() {
  const names = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => n === "_ga" || n.startsWith("_ga_") || n === "_gid");

  // GA writes on the registrable domain, so expiring on the exact host is not
  // enough — walk up the label chain and expire on each candidate.
  const parts = location.hostname.split(".");
  const domains = ["", ...parts.map((_, i) => `.${parts.slice(i).join(".")}`)];

  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT${
        domain ? `; domain=${domain}` : ""
      }`;
    }
  }
}

function decide(): Status {
  if (hasGpcOptOut()) return "off";

  // An explicit choice outranks geography in both directions: a declining
  // visitor in a no-banner country still gets no tag.
  const stored = readStoredChoice();
  if (stored === "denied") return "off";
  if (stored === "granted") return "load";

  const cookie = readCookie(REGIME_COOKIE);
  const regime: ConsentRegime =
    cookie && isConsentRegime(cookie) ? cookie : FALLBACK_REGIME;

  return requiresPriorConsent(regime) ? "ask" : "load";
}

/**
 * The single decision point for whether Google Analytics exists on this page.
 *
 * Hard gate, not Consent Mode: in a prior-consent jurisdiction the gtag script
 * is never inserted until the visitor accepts, so no request reaches Google
 * and no storage is written. There is no "denied" ping to explain away.
 */
export default function Analytics() {
  const [status, setStatus] = useState<Status>("resolving");

  const sync = useCallback(() => setStatus(decide()), []);

  useEffect(() => {
    sync();
    window.addEventListener(CONSENT_CHANGED_EVENT, sync);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, sync);
  }, [sync]);

  // Enforce the decision against a gtag that may already be running.
  useEffect(() => {
    if (!GA_MEASUREMENT_ID || status === "resolving") return;
    const off = status !== "load";
    setGaDisabled(GA_MEASUREMENT_ID, off);
    if (off) clearGaCookies();
  }, [status]);

  // No measurement ID (local dev, preview deploys) means no analytics and no
  // banner asking to enable analytics that would not run.
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      {status === "load" && (
        <>
          <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
          <PageViews />
        </>
      )}
      {status === "ask" && (
        <ConsentBanner
          onAccept={() => writeStoredChoice("granted")}
          onDecline={() => writeStoredChoice("denied")}
        />
      )}
    </>
  );
}
