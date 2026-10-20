import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { buildCalUrl } from "@/app/book/_lib/cal-url";
import { POST } from "@/app/book/handoff/route";
import { BOOKING_URL } from "@/lib/config";
import type { BookInput } from "@/lib/validators/book";

const FIT: BookInput = {
  building: "A clinic's booking tool & more?",
  budget: "15k-75k",
  start: "this-month",
  role: "fractional-cto",
  name: "Robin Example",
  email: "robin+test@example.test",
};

const CAL = new URL(BOOKING_URL);
const ORIGIN = "http://localhost:4310";

// ---------------------------------------------------------------- C1

test("C1 the builder keeps BOOKING_URL's origin and path and only the prefill", () => {
  const url = buildCalUrl(FIT);
  assert.equal(url.origin, CAL.origin);
  assert.equal(url.pathname, CAL.pathname);
  assert.deepEqual([...url.searchParams.keys()].sort(), [
    "email",
    "metadata[role]",
    "metadata[source]",
    "name",
    "notes",
  ]);
  assert.equal(url.searchParams.get("name"), "Robin Example");
  assert.equal(url.searchParams.get("email"), "robin+test@example.test");
  assert.equal(url.searchParams.get("notes"), FIT.building);
  assert.equal(url.searchParams.get("metadata[source]"), "site-screening");
  assert.equal(url.searchParams.get("metadata[role]"), "fractional-cto");
});

test("C1 every value is URL-encoded", () => {
  const raw = buildCalUrl(FIT).search;
  assert.ok(!raw.includes(" "));
  assert.ok(!raw.includes("&more"));
  assert.ok(raw.includes("robin%2Btest%40example.test"));
});

test("C1 with name blank there is no name parameter", () => {
  const url = buildCalUrl({ ...FIT, name: undefined });
  assert.equal(url.searchParams.has("name"), false);
});

// ---------------------------------------------------------------- C2

function post(fields: Record<string, string> | null) {
  return POST(
    new NextRequest(`${ORIGIN}/book/handoff`, {
      method: "POST",
      body: fields ? new URLSearchParams(fields) : undefined,
    }),
  );
}

const FIT_FORM: Record<string, string> = {
  building: FIT.building,
  budget: FIT.budget,
  start: FIT.start,
  role: FIT.role,
  name: FIT.name!,
  email: FIT.email,
};

test("C2 a fit set answers 303 to the builder's URL", async () => {
  const res = await post(FIT_FORM);
  assert.equal(res.status, 303);
  assert.equal(res.headers.get("location"), buildCalUrl(FIT).toString());
});

const BACK_TO_BOOK: [string, Record<string, string> | null][] = [
  ["not a fit on re-run", { ...FIT_FORM, budget: "under-15k" }],
  ["a website on re-run", { ...FIT_FORM, role: "website-or-brand" }],
  [
    "a missing budget",
    Object.fromEntries(
      Object.entries(FIT_FORM).filter(([key]) => key !== "budget"),
    ),
  ],
  ["an unknown start", { ...FIT_FORM, start: "tomorrow" }],
  ["an unknown role", { ...FIT_FORM, role: "ceo" }],
  ["a malformed email", { ...FIT_FORM, email: "robin@example" }],
  ["an empty body", null],
  ["an empty form", {}],
];

for (const [why, fields] of BACK_TO_BOOK) {
  test(`C2 ${why} answers 303 to /book with no query`, async () => {
    const res = await post(fields);
    assert.equal(res.status, 303);
    const location = new URL(res.headers.get("location")!);
    assert.equal(location.origin, ORIGIN);
    assert.equal(location.pathname, "/book");
    assert.equal(location.search, "");
  });
}

test("C2 a forged redirect field never moves the target", async () => {
  const res = await post({
    ...FIT_FORM,
    url: "https://evil.example",
    redirect: "https://evil.example",
  });
  const location = new URL(res.headers.get("location")!);
  assert.equal(location.origin, CAL.origin);
  assert.equal(location.searchParams.has("url"), false);
});

test("C2 no Location host is other than Cal.com's or this origin's", async () => {
  for (const [, fields] of [["fit", FIT_FORM], ...BACK_TO_BOOK] as const) {
    const res = await post(fields);
    const host = new URL(res.headers.get("location")!).host;
    assert.ok([CAL.host, new URL(ORIGIN).host].includes(host), host);
  }
});
