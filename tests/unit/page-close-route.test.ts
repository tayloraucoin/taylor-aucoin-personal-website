import assert from "node:assert/strict";
import { test } from "node:test";
import { guardHarness } from "../../app/test-harness/analytics/guard";

const NOT_FOUND = /NEXT_HTTP_ERROR_FALLBACK;404|NEXT_NOT_FOUND/;

test("C5 the close test route calls notFound() on a production deployment", async () => {
  const saved = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = "production";
  try {
    const { default: CloseHarness } =
      await import("../../app/test-harness/close/page");
    assert.throws(() => CloseHarness(), NOT_FOUND);
  } finally {
    if (saved === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = saved;
  }
});

test("C5 the injected helper decides: production 404s, otherwise renders", () => {
  assert.throws(() => guardHarness(() => true), NOT_FOUND);
  assert.doesNotThrow(() => guardHarness(() => false));
});
