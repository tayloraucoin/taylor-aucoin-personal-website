/**
 * A URL with every `q` parameter removed, for `page_location` and
 * `page_referrer` (D-SITE-179). `q` is the /capabilities filter's typed text,
 * which GA must never see (D-SITE-176); `tab`, every other parameter, the path
 * and the hash stay exactly as written.
 *
 * Works on the raw query rather than through `URLSearchParams`, which would
 * re-encode the parameters it keeps. A key is `q` when it decodes to `q`, so
 * `%71=` and a bare `q` go too.
 */
export function stripQuery(href: string): string {
  if (!href) return href;

  const hashAt = href.indexOf("#");
  const hash = hashAt === -1 ? "" : href.slice(hashAt);
  const beforeHash = hashAt === -1 ? href : href.slice(0, hashAt);

  const queryAt = beforeHash.indexOf("?");
  if (queryAt === -1) return href;

  const base = beforeHash.slice(0, queryAt);
  const kept = beforeHash
    .slice(queryAt + 1)
    .split("&")
    .filter((pair) => pair !== "" && decodeKey(pair.split("=")[0]) !== "q");

  return `${base}${kept.length ? `?${kept.join("&")}` : ""}${hash}`;
}

function decodeKey(raw: string): string {
  try {
    return decodeURIComponent(raw.replace(/\+/g, " "));
  } catch {
    // A malformed escape cannot decode to `q`, so the raw key is the answer.
    return raw;
  }
}
