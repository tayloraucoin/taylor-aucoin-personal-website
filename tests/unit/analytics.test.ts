import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { guardHarness } from "@/app/test-harness/analytics/guard";
import { publishedWork } from "@/content/work";
import { allowedParams, track } from "@/lib/analytics/events";
import { stripQuery } from "@/lib/analytics/location";
import { PUBLISHED_SLUGS } from "@/lib/work/published";

const g = globalThis as unknown as Record<string, unknown>;

// ---------------------------------------------------------------- C1

test("C1 stripQuery removes q and keeps tab, the rest, the path and the hash", () => {
  assert.equal(
    stripQuery("https://x.test/capabilities?q=react&tab=build#list"),
    "https://x.test/capabilities?tab=build#list",
  );
});

test("C1 stripQuery removes a repeated q", () => {
  assert.equal(
    stripQuery("https://x.test/?q=a&tab=x&q=b&z=1"),
    "https://x.test/?tab=x&z=1",
  );
});

test("C1 stripQuery removes an empty and a bare q", () => {
  assert.equal(stripQuery("https://x.test/?q=&tab=x"), "https://x.test/?tab=x");
  assert.equal(stripQuery("https://x.test/?q&tab=x"), "https://x.test/?tab=x");
});

test("C1 stripQuery removes a percent-encoded q key", () => {
  assert.equal(
    stripQuery("https://x.test/?%71=sentinel&tab=x"),
    "https://x.test/?tab=x",
  );
});

test("C1 stripQuery drops the ? when q was the only parameter, keeping the hash", () => {
  assert.equal(stripQuery("https://x.test/a?q=s#h"), "https://x.test/a#h");
});

test("C1 stripQuery keeps other parameters byte for byte", () => {
  assert.equal(
    stripQuery("https://x.test/?a=%20b+c&q=s&quiz=1"),
    "https://x.test/?a=%20b+c&quiz=1",
  );
});

test("C1 stripQuery leaves a URL with no query alone", () => {
  assert.equal(
    stripQuery("https://x.test/work#top"),
    "https://x.test/work#top",
  );
  assert.equal(stripQuery(""), "");
});

// ---------------------------------------------------------------- C2

test("C2 allowedParams drops an unknown parameter", () => {
  assert.deepEqual(
    allowedParams("book_call_click", {
      surface: "home",
      placement: "hero",
      email: "a@b.test",
    }),
    { surface: "home", placement: "hero" },
  );
});

test("C2 allowedParams drops the event when a required value is outside its set", () => {
  assert.equal(
    allowedParams("book_call_click", { surface: "home", placement: "typed" }),
    null,
  );
});

test("C2 allowedParams drops a slug that is not a published study", () => {
  assert.deepEqual(
    allowedParams("book_call_click", {
      surface: "case-study",
      placement: "close",
      slug: "no-such-study",
    }),
    { surface: "case-study", placement: "close" },
  );
});

test("C2 allowedParams keeps a published slug on case-study only", () => {
  const slug = PUBLISHED_SLUGS[0];
  assert.deepEqual(
    allowedParams("book_call_click", {
      surface: "case-study",
      placement: "close",
      slug,
    }),
    { surface: "case-study", placement: "close", slug },
  );
  assert.deepEqual(
    allowedParams("book_call_click", {
      surface: "home",
      placement: "close",
      slug,
    }),
    { surface: "home", placement: "close" },
  );
});

test("C2 allowedParams drops the event when a required parameter is missing", () => {
  assert.equal(
    allowedParams("contact_note_sent", { surface: "services" }),
    null,
  );
});

test("C2 allowedParams drops an unknown event name, coded_intake_start included", () => {
  assert.equal(allowedParams("coded_intake_start", {}), null);
  assert.equal(allowedParams("toString", {}), null);
});

test("C2 allowedParams drops a non-string value", () => {
  assert.equal(
    allowedParams("screening_outcome", {
      outcome: ["fit"] as unknown as string,
    }),
    null,
  );
});

let sent: unknown[][];

beforeEach(() => {
  sent = [];
  g.location = { href: "https://x.test/?q=sentinel&tab=x" };
  g.document = { referrer: "https://x.test/capabilities?q=sentinel" };
});

afterEach(() => {
  delete g.gtag;
  delete g.location;
  delete g.document;
});

test("C2 track sends nothing before the tag has loaded", () => {
  assert.doesNotThrow(() => track("screening_outcome", { outcome: "fit" }));
});

test("C2 track sets the stripped page fields, then sends the filtered event", () => {
  g.gtag = (...args: unknown[]) => sent.push(args);
  track("screening_outcome", { outcome: "fit" });
  assert.deepEqual(sent, [
    [
      "set",
      {
        page_location: "https://x.test/?tab=x",
        page_referrer: "https://x.test/capabilities",
      },
    ],
    ["event", "screening_outcome", { outcome: "fit" }],
  ]);
});

test("C2 track sends nothing for a dropped event", () => {
  g.gtag = (...args: unknown[]) => sent.push(args);
  track("screening_outcome", {
    outcome: "maybe" as unknown as "fit",
  });
  assert.deepEqual(sent, []);
});

// ---------------------------------------------------------------- C8

test("C8 the harness calls notFound() on a production deployment", () => {
  assert.throws(
    () => guardHarness(() => true),
    (error: unknown) =>
      String((error as { digest?: string }).digest).includes("404"),
  );
  assert.doesNotThrow(() => guardHarness(() => false));
});

test("C8 PUBLISHED_SLUGS equals content/work's published studies", () => {
  assert.deepEqual(
    [...PUBLISHED_SLUGS].sort(),
    publishedWork.map((w) => w.slug).sort(),
  );
});
