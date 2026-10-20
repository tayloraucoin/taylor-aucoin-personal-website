import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const file = readFileSync("docs/measurement/metrics/definitions.md", "utf8");

test("C7 definitions.md holds SITE-M1 v1", () => {
  assert.match(file, /## SITE-M1 .* v1/);
});

test("C7 SITE-M1 counts Cal.com bookings carrying source=site-screening", () => {
  assert.match(
    file,
    /Cal\.com bookings carrying `metadata\[source\]=site-screening`/,
  );
});

test("C7 SITE-M1's denominator is book_call_click at screening_fit", () => {
  const row = file.split("\n").find((line) => line.startsWith("| Denominator"));
  assert.ok(row, "a Denominator row");
  assert.match(row, /book_call_click/);
  assert.match(row, /screening_fit/);
});
