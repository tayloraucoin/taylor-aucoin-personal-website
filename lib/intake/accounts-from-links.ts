import { parseLinks } from "./source-kinds";

/**
 * The step-1 links box, read as the step-10 "accounts around the web" answer.
 *
 * Taylor pasted a client's IMDb, Vimeo, LinkedIn, YouTube and Instagram into
 * step 1, reached step 10, and found the accounts block empty (2026-09-05).
 * The primer could never have filled it: its field inventory is derived from
 * the *string* fields of each step, and `accounts` is an array of objects, so
 * the key appears in no prompt anywhere.
 *
 * **This is arithmetic rather than a model call, and that is the point.** The
 * client typed these URLs; recognising `vimeo.com` does not need judgement, and
 * a model asked to do it could return a profile that does not exist. Nothing
 * here invents a handle, guesses a platform from a name, or follows a link.
 *
 * Only recognised profile hosts are returned. A personal site or an article in
 * that same box is a page worth reading rather than an account to list, and
 * `currentWebsite` already asks for the former.
 */

/**
 * Hosts worth listing, and what the client would call them.
 *
 * Matched on the registrable host with any `www.` removed, plus subdomains, so
 * `uk.linkedin.com` and `m.imdb.com` both land. Extend it when a real intake
 * turns up a platform that belongs here. `[PROVISIONAL — the list, not the
 * mechanism]`
 */
const PLATFORMS: ReadonlyArray<{ host: string; label: string }> = [
  { host: "imdb.com", label: "IMDb" },
  { host: "linkedin.com", label: "LinkedIn" },
  { host: "vimeo.com", label: "Vimeo" },
  { host: "youtube.com", label: "YouTube" },
  { host: "instagram.com", label: "Instagram" },
  { host: "facebook.com", label: "Facebook" },
  { host: "twitter.com", label: "X" },
  { host: "x.com", label: "X" },
  { host: "tiktok.com", label: "TikTok" },
  { host: "soundcloud.com", label: "SoundCloud" },
  { host: "spotify.com", label: "Spotify" },
  { host: "bandcamp.com", label: "Bandcamp" },
  { host: "behance.net", label: "Behance" },
  { host: "dribbble.com", label: "Dribbble" },
  { host: "github.com", label: "GitHub" },
  { host: "substack.com", label: "Substack" },
  { host: "medium.com", label: "Medium" },
  { host: "etsy.com", label: "Etsy" },
];

function platformFor(hostname: string): string | null {
  const host = hostname.replace(/^www\./, "").toLowerCase();

  for (const entry of PLATFORMS) {
    if (host === entry.host || host.endsWith(`.${entry.host}`)) {
      return entry.label;
    }
  }

  return null;
}

/**
 * One `{ platform, link }` per recognised profile, in the order they were
 * typed, with one entry per platform. A client who pasted two YouTube URLs
 * meant one channel and a video on it; the first is the one that reads as
 * their account.
 */
export function accountsFromLinks(
  raw: string | null | undefined,
): Array<{ platform: string; link: string }> {
  const { urls } = parseLinks(raw);
  const seen = new Set<string>();
  const accounts: Array<{ platform: string; link: string }> = [];

  for (const url of urls) {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      continue;
    }

    const platform = platformFor(parsed.hostname);
    if (!platform || seen.has(platform)) continue;

    seen.add(platform);
    accounts.push({ platform, link: url });
  }

  return accounts;
}
